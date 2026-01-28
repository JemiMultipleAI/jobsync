import { isSupabaseConfigured, uploadToSupabase, deleteFromSupabase, extractKeyFromUrl, type UploadResult } from "./supabase";
import { uploadToLocal, deleteFromLocal, type UploadFileOptions as LocalUploadOptions } from "./local";
import { logger } from "@/lib/logger";

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
  logger.debug("Storage check:", {
    supabaseConfigured: isSupabaseConfigured(),
    folder: options.folder || "root",
  });
  
  if (isSupabaseConfigured()) {
    logger.debug("Using Supabase storage for:", options.folder || "root");
    return uploadToSupabase({
      file: options.file,
      filename: options.filename,
      contentType: getContentType(options.filename),
      folder: options.folder,
    });
  } else {
    logger.warn("Using local storage (Supabase not configured) for:", options.folder || "root");
    return uploadToLocal(options as LocalUploadOptions);
  }
}

export async function deleteFile(urlOrKey: string): Promise<void> {
  if (isSupabaseConfigured()) {
    logger.debug("Deleting from Supabase:", urlOrKey);
    // If it's a full URL, extract the key
    const key = urlOrKey.startsWith("http") ? extractKeyFromUrl(urlOrKey) : urlOrKey;
    return deleteFromSupabase(key);
  } else {
    logger.debug("Deleting from local storage:", urlOrKey);
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

