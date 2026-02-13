import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import { generateToken } from "@/lib/auth/jwt";
import { z } from "zod";
import { sanitizeString, sanitizeEmail } from "@/lib/utils/sanitize";
import { env } from "@/lib/config/env";
import { rateLimit, rateLimitConfigs } from "@/lib/api/rate-limit";
import { logRequest } from "@/lib/api/request-logger";

const signupSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["job_seeker", "employer"]).default("job_seeker"),
});

/**
 * POST /api/auth/signup
 * Creates a new user account
 * @param request - The NextRequest object
 * @returns NextResponse with user data and JWT token
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const rateLimitError = rateLimit(request, rateLimitConfigs.auth);
    if (rateLimitError) {
      logRequest(request, rateLimitError, startTime);
      return rateLimitError;
    }

    await connectDB();

    const body = await request.json();
    
    // Sanitize input before validation
    const sanitizedBody = {
      firstname: sanitizeString(body.firstname || ""),
      lastname: sanitizeString(body.lastname || ""),
      email: sanitizeEmail(body.email || ""),
      password: body.password, // Don't sanitize password - it will be hashed
      role: body.role || "job_seeker",
    };
    
    const validatedData = signupSchema.parse(sanitizedBody);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create user (map job_seeker to user, employer to employer role)
    const user = await User.create({
      name: `${validatedData.firstname} ${validatedData.lastname}`,
      email: validatedData.email,
      password: validatedData.password, // Will be hashed by pre-save hook
      role: validatedData.role === "employer" ? "employer" : "user",
    });

    // Generate JWT token
    const token = generateToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    // Create response
    const response = NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileCompletion: user.profileCompletion,
        },
      },
      { status: 201 }
    );

    // Set HttpOnly cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      ...(env.NODE_ENV === "production" && env.COOKIE_DOMAIN
        ? { domain: env.COOKIE_DOMAIN }
        : {}),
    });

    logRequest(request, response, startTime);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

