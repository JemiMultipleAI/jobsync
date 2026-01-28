import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import { authenticateRequest } from "@/lib/api/middleware";
import { uploadFile, deleteFile } from "@/lib/storage";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

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
        { error: "Invalid file type. Only PDF, DOC, and DOCX are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Get user to check for existing resume
    const user = await User.findById(authResult.user!.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete old resume if exists
    if (user.resume) {
      try {
        await deleteFile(user.resume);
      } catch (_error) {
        console.error("Error deleting old resume:", _error);
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
      folder: "resumes",
    });

    // Update user record
    const updatedUser = await User.findByIdAndUpdate(
      authResult.user!.userId,
      { resume: uploadResult.url },
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
      message: "Resume uploaded successfully",
      resume: uploadResult.url,
      profileCompletion: updatedUser.profileCompletion,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const user = await User.findById(authResult.user!.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete file from storage
    if (user.resume) {
      try {
        await deleteFile(user.resume);
      } catch (error) {
        console.error("Error deleting resume file:", error);
        // Continue even if file deletion fails
      }
    }

    // Update user record
    const updatedUser = await User.findByIdAndUpdate(
      authResult.user!.userId,
      { $unset: { resume: "" } },
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
      message: "Resume deleted successfully",
      profileCompletion: updatedUser.profileCompletion,
    });
  } catch (error) {
    console.error("Resume delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
