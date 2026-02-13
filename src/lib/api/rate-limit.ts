/**
 * Simple in-memory rate limiting middleware
 * For production, consider using Redis or a dedicated rate limiting service
 */

import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (for production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Gets a unique identifier for rate limiting based on IP and optional user ID
 * @param request - The NextRequest object
 * @param userId - Optional user ID for per-user rate limiting
 * @returns Unique identifier string
 */
function getRateLimitKey(
  request: NextRequest,
  userId?: string
): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";
  
  if (userId) {
    return `rate-limit:${userId}`;
  }
  return `rate-limit:${ip}`;
}

/**
 * Rate limiting middleware
 * @param request - The NextRequest object
 * @param config - Rate limit configuration
 * @param userId - Optional user ID for per-user rate limiting
 * @returns NextResponse with error if rate limit exceeded, null if allowed
 */
export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): NextResponse | null {
  const key = getRateLimitKey(request, userId);
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return null; // Allow request
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return NextResponse.json(
      {
        error: "Too many requests",
        message: `Rate limit exceeded. Please try again after ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(config.maxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(entry.resetTime),
        },
      }
    );
  }

  // Increment count
  entry.count++;
  return null; // Allow request
}

/**
 * Predefined rate limit configurations
 */
export const rateLimitConfigs = {
  // Strict rate limit for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
  },
  // Standard rate limit for general API endpoints
  standard: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  // Relaxed rate limit for read operations
  read: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120, // 120 requests per minute
  },
} as const;
