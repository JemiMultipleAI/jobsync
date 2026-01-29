import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { uploadFile, deleteFile } from "@/lib/storage";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import { z } from "zod";

const saveResumeSchema = z.object({
  html: z.string().min(1, "HTML content is required"),
  filename: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const body = await request.json();
    const validatedData = saveResumeSchema.parse(body);

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

    // Convert HTML to buffer
    const buffer = Buffer.from(validatedData.html, "utf-8");
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = validatedData.filename || `resume-${authResult.user!.userId}-${timestamp}.html`;

    // Upload to storage
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
      message: "Resume saved successfully",
      resume: uploadResult.url,
      profileCompletion: updatedUser.profileCompletion,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}
