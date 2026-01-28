import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import { generateToken } from "@/lib/auth/jwt";
import { z } from "zod";
import { handleApiError } from "@/lib/api/error-handler";
import { env } from "@/lib/config/env";
import { sanitizeString, sanitizeEmail } from "@/lib/utils/sanitize";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["user", "admin", "employer"]).default("user"),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Sanitize input before validation
    const sanitizedBody = {
      name: sanitizeString(body.name || ""),
      email: sanitizeEmail(body.email || ""),
      password: body.password, // Don't sanitize password - it will be hashed
      role: body.role || "user",
    };
    
    const validatedData = registerSchema.parse(sanitizedBody);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password, // Will be hashed by pre-save hook
      role: validatedData.role,
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
        message: "User registered successfully",
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

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

