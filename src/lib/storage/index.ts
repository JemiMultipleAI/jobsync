import { isSupabaseConfigured, uploadToSupabase, deleteFromSupabase, extractKeyFromUrl, type UploadResult } from "./supabase";
import { uploadToLocal, deleteFromLocal, type UploadFileOptions as LocalUploadOptions } from "./local";

export interface UploadFileOptions {
  file: Buffer;
  filename: string;
  folder?: string; // e.g., "resumes", "profiles"
}

/**
 * Unified storage interface that automatically uses Supabase if configured,
 * otherwise falls back to local filesystem storage
 */
export async function uploadFile(options: UploadFileOptions): Promise<UploadResult> {
  console.log("Storage check:", {
    supabaseConfigured: isSupabaseConfigured(),
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    bucketName: process.env.SUPABASE_BUCKET_NAME || "jobsync-uploads",
    urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET",
    keyValue: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET",
  });
  
  if (isSupabaseConfigured()) {
    console.log("✅ Using Supabase storage for:", options.folder || "root");
    return uploadToSupabase({
      file: options.file,
      filename: options.filename,
      contentType: getContentType(options.filename),
      folder: options.folder,
    });
  } else {
    console.log("⚠️ Using local storage (Supabase not configured) for:", options.folder || "root");
    return uploadToLocal(options as LocalUploadOptions);
  }
}

export async function deleteFile(urlOrKey: string): Promise<void> {
  if (isSupabaseConfigured()) {
    console.log("🗑️ Deleting from Supabase:", urlOrKey);
    // If it's a full URL, extract the key
    const key = urlOrKey.startsWith("http") ? extractKeyFromUrl(urlOrKey) : urlOrKey;
    return deleteFromSupabase(key);
  } else {
    console.log("🗑️ Deleting from local storage:", urlOrKey);
    // For local storage, the key is the path
    return deleteFromLocal(urlOrKey);
  }
}

/**
 * Get content type from filename extension
 */
function getContentType(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  return contentTypes[extension || ""] || "application/octet-stream";
}

