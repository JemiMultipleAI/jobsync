import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || "jobsync-uploads";

// Initialize Supabase client with service role key (for server-side operations)
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export interface UploadFileOptions {
  file: Buffer;
  filename: string;
  contentType?: string;
  folder?: string; // e.g., "resumes", "profiles"
}

export interface UploadResult {
  url: string;
  key: string; // The file path in Supabase
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadToSupabase(options: UploadFileOptions): Promise<UploadResult> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const filePath = options.folder
    ? `${options.folder}/${options.filename}`
    : options.filename;

  console.log("📤 Uploading to Supabase:", {
    bucket: SUPABASE_BUCKET_NAME,
    filePath,
    fileSize: options.file.length,
    contentType: options.contentType || "application/octet-stream",
  });

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET_NAME)
    .upload(filePath, options.file, {
      contentType: options.contentType || "application/octet-stream",
      upsert: true, // Replace if file exists
    });

  if (error) {
    console.error("❌ Supabase upload error:", {
      message: error.message,
      statusCode: error.statusCode,
      error: error,
    });
    throw new Error(`Failed to upload file to Supabase: ${error.message}`);
  }

  console.log("✅ Supabase upload successful:", data.path);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(SUPABASE_BUCKET_NAME)
    .getPublicUrl(filePath);

  console.log("🔗 Generated public URL:", urlData.publicUrl);

  return {
    url: urlData.publicUrl,
    key: filePath,
  };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFromSupabase(key: string): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET_NAME)
    .remove([key]);

  if (error) {
    console.error("Supabase delete error:", error);
    throw new Error(`Failed to delete file from Supabase: ${error.message}`);
  }
}

/**
 * Extract the key from a full Supabase URL
 */
export function extractKeyFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Supabase URLs format: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path
    const pathParts = urlObj.pathname.split("/");
    const bucketIndex = pathParts.indexOf("public");
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      // Skip "public" and bucket name, get the rest
      return pathParts.slice(bucketIndex + 2).join("/");
    }
    // Fallback: return pathname without leading slash
    return urlObj.pathname.startsWith("/") ? urlObj.pathname.slice(1) : urlObj.pathname;
  } catch {
    // If URL parsing fails, assume it's already a key
    return url;
  }
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    SUPABASE_URL &&
    SUPABASE_SERVICE_ROLE_KEY &&
    SUPABASE_BUCKET_NAME
  );
}

