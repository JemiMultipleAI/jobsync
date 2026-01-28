/**
 * Environment variable configuration with validation
 * This ensures all required environment variables are present at startup
 */

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Please add it to your .env.local file.`
    );
  }
  return value;
}

function getOptionalEnv(key: string, defaultValue: string = ""): string {
  return process.env[key] || defaultValue;
}

export const env = {
  // Database
  MONGODB_URI: getRequiredEnv("MONGODB_URI"),

  // JWT
  JWT_SECRET: getRequiredEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getOptionalEnv("JWT_EXPIRES_IN", "7d"),

  // Cookie
  COOKIE_DOMAIN: getOptionalEnv("COOKIE_DOMAIN", ""),

  // Supabase (optional - falls back to local storage)
  NEXT_PUBLIC_SUPABASE_URL: getOptionalEnv("NEXT_PUBLIC_SUPABASE_URL", ""),
  SUPABASE_SERVICE_ROLE_KEY: getOptionalEnv("SUPABASE_SERVICE_ROLE_KEY", ""),
  SUPABASE_BUCKET_NAME: getOptionalEnv("SUPABASE_BUCKET_NAME", "jobsync-uploads"),

  // AWS R2 (optional - alternative storage)
  R2_ACCOUNT_ID: getOptionalEnv("R2_ACCOUNT_ID", ""),
  R2_ACCESS_KEY_ID: getOptionalEnv("R2_ACCESS_KEY_ID", ""),
  R2_SECRET_ACCESS_KEY: getOptionalEnv("R2_SECRET_ACCESS_KEY", ""),
  R2_BUCKET_NAME: getOptionalEnv("R2_BUCKET_NAME", ""),
  R2_PUBLIC_URL: getOptionalEnv("R2_PUBLIC_URL", ""),

  // Node environment
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;

// Validate critical environment variables at module load
if (env.NODE_ENV === "production") {
  // In production, JWT_SECRET should be strong
  if (env.JWT_SECRET.length < 32) {
    console.warn(
      "⚠️  WARNING: JWT_SECRET should be at least 32 characters long in production!"
    );
  }
}

