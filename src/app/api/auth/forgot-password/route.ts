import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      // Still return success to prevent email enumeration
      return NextResponse.json({
        message: "If an account exists with that email, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = resetTokenExpiry;
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;

    // TODO: Send email with reset link
    // For now, we'll log it. In production, use a service like SendGrid, Resend, or Nodemailer
    console.log("Password Reset Link:", resetUrl);
    console.log("For user:", user.email);

    // In production, send email here:
    // await sendPasswordResetEmail(user.email, resetUrl);

    return NextResponse.json({
      message: "If an account exists with that email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

