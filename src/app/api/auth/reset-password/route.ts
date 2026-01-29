import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordHistory +password");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if password matches current password
    const matchesCurrent = await bcrypt.compare(password, user.password);
    if (matchesCurrent) {
      return NextResponse.json(
        { error: "You cannot reuse your current password" },
        { status: 400 }
      );
    }

    // Check against password history
    if (user.passwordHistory && user.passwordHistory.length > 0) {
      for (const oldPasswordHash of user.passwordHistory) {
        const matchesOld = await bcrypt.compare(password, oldPasswordHash);
        if (matchesOld) {
          return NextResponse.json(
            { error: "You cannot reuse a previous password" },
            { status: 400 }
          );
        }
      }
    }

    // Add current password to history before changing it (keep last 5)
    const currentHistory = (user.passwordHistory || []) as string[];
    const passwordHistory = [user.password, ...currentHistory].slice(0, 5);

    // Update user password and clear reset token
    // The pre-save hook will hash the password, but we need to set passwordHistory first
    user.passwordHistory = passwordHistory;
    user.password = password; // Set plain password, pre-save hook will hash it
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

