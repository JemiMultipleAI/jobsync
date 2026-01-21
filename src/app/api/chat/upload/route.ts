import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { authenticateRequest } from "@/lib/api/middleware";
import { uploadFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authResult = await authenticateRequest(request);

    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Upload file to Supabase (chat folder)
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFile({
      file: buffer,
      filename: file.name,
      folder: `chat/${authResult.user.userId}`,
    });
    const url = result.url;

    // Determine attachment type
    let attachmentType: "image" | "file" | "document" = "file";
    if (file.type.startsWith("image/")) {
      attachmentType = "image";
    } else if (file.type === "application/pdf" || file.type.includes("document") || file.type.includes("word")) {
      attachmentType = "document";
    }

    return NextResponse.json({
      attachment: {
        type: attachmentType,
        url,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
