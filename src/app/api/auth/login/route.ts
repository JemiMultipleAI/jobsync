import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import { generateToken } from "@/lib/auth/jwt";
import { z } from "zod";
import { handleApiError } from "@/lib/api/error-handler";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/logger";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Simple email validation (no heavy sanitization needed for login - just a DB lookup)
    // Zod will validate the email format
    const validatedData = loginSchema.parse({
      email: (body.email || "").toLowerCase().trim(),
      password: body.password,
    });

    // Find user and include password
    const user = await User.findOne({ email: validatedData.email }).select(
      "+password"
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    // Create response
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileCompletion: user.profileCompletion,
        },
      },
      { status: 200 }
    );

    // Set HttpOnly cookie
    // Note: Don't set domain in development (localhost), let browser handle it
    const cookieOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days (in seconds)
      path: "/",
      ...(env.NODE_ENV === "production" && env.COOKIE_DOMAIN
        ? { domain: env.COOKIE_DOMAIN }
        : {}),
    };
    
    response.cookies.set("token", token, cookieOptions);
    
    // Debug: Log cookie setting (development only)
    logger.debug("[Login] Cookie set", {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
      path: cookieOptions.path,
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

