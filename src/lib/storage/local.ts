import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export interface UploadFileOptions {
  file: Buffer;
  filename: string;
  folder?: string; // e.g., "resumes", "profiles"
  contentType?: string; // Optional, not used for local storage
}

export interface UploadResult {
  url: string;
  key: string; // The file path
}

/**
 * Upload a file to local filesystem (fallback when Supabase is not configured)
 */
export async function uploadToLocal(options: UploadFileOptions): Promise<UploadResult> {
  const uploadsDir = options.folder
    ? join(process.cwd(), "public", "uploads", options.folder)
    : join(process.cwd(), "public", "uploads");

  // Create directory if it doesn't exist
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const filepath = join(uploadsDir, options.filename);
  await writeFile(filepath, options.file);

  const url = options.folder
    ? `/uploads/${options.folder}/${options.filename}`
    : `/uploads/${options.filename}`;

  return {
    url,
    key: url, // For local storage, key is the same as URL
  };
}

/**
 * Delete a file from local filesystem
 */
export async function deleteFromLocal(key: string): Promise<void> {
  // Remove leading slash if present
  const filepath = key.startsWith("/")
    ? join(process.cwd(), "public", key)
    : join(process.cwd(), "public", key);

  if (existsSync(filepath)) {
    await unlink(filepath);
  }
}

