import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // Your R2 public URL or custom domain

// Initialize S3 client for R2
// R2 uses S3-compatible API but with a custom endpoint
const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ACCOUNT_ID 
    ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined,
  credentials: R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY
    ? {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      }
    : undefined,
});

export interface UploadFileOptions {
  file: Buffer;
  filename: string;
  contentType: string;
  folder?: string; // e.g., "resumes", "profiles"
}

export interface UploadResult {
  url: string;
  key: string; // The object key in R2
}

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadToR2(options: UploadFileOptions): Promise<UploadResult> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME is not configured");
  }

  const key = options.folder
    ? `${options.folder}/${options.filename}`
    : options.filename;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: options.file,
    ContentType: options.contentType,
    // Make files publicly accessible (adjust based on your needs)
    // For private files, you can use presigned URLs instead
    // ACL: "public-read", // R2 doesn't support ACL, use public bucket or presigned URLs
  });

  try {
    await s3Client.send(command);

    // Construct public URL
    // If you have a custom domain: https://your-domain.com/filename
    // If using R2 public URL: https://pub-xxxxx.r2.dev/filename
    // If using presigned URLs, generate them on-demand
    let url: string;
    if (R2_PUBLIC_URL) {
      // Use custom domain or configured public URL
      url = R2_PUBLIC_URL.endsWith("/")
        ? `${R2_PUBLIC_URL}${key}`
        : `${R2_PUBLIC_URL}/${key}`;
    } else if (R2_ACCOUNT_ID) {
      // Use R2 public URL format
      url = `https://pub-${R2_ACCOUNT_ID}.r2.dev/${key}`;
    } else {
      // Fallback: return key (will need presigned URL)
      url = key;
    }

    return {
      url,
      key,
    };
  } catch (error: any) {
    console.error("R2 upload error:", error);
    throw new Error(`Failed to upload file to R2: ${error.message}`);
  }
}

/**
 * Delete a file from Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME is not configured");
  }

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
  } catch (error: any) {
    console.error("R2 delete error:", error);
    throw new Error(`Failed to delete file from R2: ${error.message}`);
  }
}

/**
 * Generate a presigned URL for private file access
 * Use this if your R2 bucket is private
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME is not configured");
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error: any) {
    console.error("R2 presigned URL error:", error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
}

/**
 * Extract the key from a full URL
 * Useful for extracting the key when deleting files
 */
export function extractKeyFromUrl(url: string): string {
  // Remove domain and get the path
  const urlObj = new URL(url);
  return urlObj.pathname.startsWith("/") ? urlObj.pathname.slice(1) : urlObj.pathname;
}

/**
 * Check if R2 is configured
 */
export function isR2Configured(): boolean {
  return !!(
    R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET_NAME
  );
}

