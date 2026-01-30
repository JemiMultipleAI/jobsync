import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import { authenticateRequest } from "@/lib/api/middleware";
import { uploadFile, deleteFile } from "@/lib/storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// GET - Fetch all certificates for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    let user = await User.findById(authResult.user!.userId).select("certificates profileCompletion");
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If certificates field doesn't exist, initialize it
    if (!user.certificates || !Array.isArray(user.certificates)) {
      console.log("[DEBUG] Initializing certificates array for user:", authResult.user!.userId);
      const updateResult = await User.findByIdAndUpdate(
        authResult.user!.userId,
        { $set: { certificates: [] } },
        { new: true }
      );
      console.log("[DEBUG] Update result after $set:", updateResult?.certificates);
      // Refetch the user
      user = await User.findById(authResult.user!.userId).select("certificates profileCompletion");
      console.log("[DEBUG] After refetch:", user?.certificates);
    }

    // Debug logging
    console.log("[DEBUG] User certificates from DB:", JSON.stringify(user?.certificates, null, 2));
    console.log("[DEBUG] Certificates count:", user?.certificates?.length || 0);

    return NextResponse.json({
      certificates: user?.certificates || [],
      profileCompletion: user?.profileCompletion,
    });
  } catch (error) {
    console.error("Certificate fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Upload a new certificate
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const certificateName = formData.get("name") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!certificateName || certificateName.trim().length === 0) {
      return NextResponse.json(
        { error: "Certificate name is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Get user
    const user = await User.findById(authResult.user!.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `${authResult.user!.userId}-cert-${timestamp}.${extension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to storage
    const uploadResult = await uploadFile({
      file: buffer,
      filename,
      folder: "certificates",
    });

    // Add certificate to user's certificates array
    const newCertificate = {
      name: certificateName.trim(),
      url: uploadResult.url,
      uploadedAt: new Date(),
    };

    console.log("[DEBUG] New certificate to add:", newCertificate);

    // First, ensure certificates array exists by initializing it if undefined
    // Then add the new certificate
    const existingUser = await User.findById(authResult.user!.userId);
    console.log("[DEBUG] Existing user certificates:", existingUser?.certificates);

    let updateResult;
    if (!existingUser?.certificates || !Array.isArray(existingUser.certificates)) {
      // Initialize the array with the new certificate
      console.log("[DEBUG] Certificates field doesn't exist, initializing with $set");
      updateResult = await User.findByIdAndUpdate(
        authResult.user!.userId,
        { $set: { certificates: [newCertificate] } },
        { new: true }
      );
    } else {
      // Array exists, use $push
      console.log("[DEBUG] Certificates field exists, using $push");
      updateResult = await User.findByIdAndUpdate(
        authResult.user!.userId,
        { $push: { certificates: newCertificate } },
        { new: true }
      );
    }

    console.log("[DEBUG] Update result certificates:", updateResult?.certificates);

    // Refetch the user to get the updated data and recalculate profile completion
    const updatedUser = await User.findById(authResult.user!.userId).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Recalculate profile completion
    if ('calculateProfileCompletion' in updatedUser && typeof (updatedUser as { calculateProfileCompletion: () => number }).calculateProfileCompletion === 'function') {
      updatedUser.profileCompletion = (updatedUser as { calculateProfileCompletion: () => number }).calculateProfileCompletion();
    }
    await updatedUser.save();

    // Return the certificates array (ensure it's an array)
    const certificates = updatedUser.certificates || [];

    return NextResponse.json({
      message: "Certificate uploaded successfully",
      certificate: newCertificate,
      certificates: certificates,
      profileCompletion: updatedUser.profileCompletion,
    });
  } catch (error) {
    console.error("Certificate upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a certificate
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const certificateUrl = searchParams.get("url");

    if (!certificateUrl) {
      return NextResponse.json(
        { error: "Certificate URL is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(authResult.user!.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the certificate
    const certificate = user.certificates?.find((cert: { url: string }) => cert.url === certificateUrl);
    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Delete file from storage
    try {
      await deleteFile(certificateUrl);
    } catch (error) {
      console.error("Error deleting certificate file:", error);
      // Continue even if file deletion fails
    }

    // Remove certificate from user's array
    await User.findByIdAndUpdate(
      authResult.user!.userId,
      { $pull: { certificates: { url: certificateUrl } } },
      { new: true }
    );

    // Refetch the user to get the updated data
    const updatedUser = await User.findById(authResult.user!.userId).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Recalculate profile completion
    if ('calculateProfileCompletion' in updatedUser && typeof (updatedUser as { calculateProfileCompletion: () => number }).calculateProfileCompletion === 'function') {
      updatedUser.profileCompletion = (updatedUser as { calculateProfileCompletion: () => number }).calculateProfileCompletion();
    }
    await updatedUser.save();

    // Return the certificates array (ensure it's an array)
    const certificates = updatedUser.certificates || [];

    return NextResponse.json({
      message: "Certificate deleted successfully",
      certificates: certificates,
      profileCompletion: updatedUser.profileCompletion,
    });
  } catch (error) {
    console.error("Certificate delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
