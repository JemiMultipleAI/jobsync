import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { uploadFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image (JPEG, PNG, WebP) or PDF" },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Upload file
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFile({
      file: buffer,
      filename: `certificates/${authResult.user!.userId}/${Date.now()}_${file.name}`,
      folder: "certificates",
    });
    
    const fileUrl = result.url || result.path || "";

    return NextResponse.json({
      fileUrl,
      message: "Certificate uploaded successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
