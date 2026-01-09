import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import { authenticateRequest } from "@/lib/api/middleware";
import { uploadFile, deleteFile } from "@/lib/storage";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 2MB limit" },
        { status: 400 }
      );
    }

    // Get user to check for existing profile image
    const user = await User.findById(authResult.user!.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete old profile image if exists
    if (user.profileImage) {
      try {
        await deleteFile(user.profileImage);
      } catch (_error) {
        console.error("Error deleting old profile image:", _error);
        // Continue even if deletion fails
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `${authResult.user!.userId}-${timestamp}.${extension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to storage (Supabase or local)
    const uploadResult = await uploadFile({
      file: buffer,
      filename,
      folder: "profiles",
    });

    // Update user record
    const updatedUser = await User.findByIdAndUpdate(
      authResult.user!.userId,
      { profileImage: uploadResult.url },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Recalculate profile completion
    if ('calculateProfileCompletion' in updatedUser && typeof (updatedUser as { calculateProfileCompletion: () => number }).calculateProfileCompletion === 'function') {
      updatedUser.profileCompletion = (updatedUser as { calculateProfileCompletion: () => number }).calculateProfileCompletion();
    }
    await updatedUser.save();

    return NextResponse.json({
      message: "Profile image uploaded successfully",
      profileImage: uploadResult.url,
      profileCompletion: updatedUser.profileCompletion,
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
