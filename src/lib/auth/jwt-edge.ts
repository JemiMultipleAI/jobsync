/**
 * JWT utilities for Edge Runtime (middleware)
 * Uses 'jose' library which is compatible with Edge Runtime
 */

import { jwtVerify, SignJWT } from "jose";
import { env } from "@/lib/config/env";

const JWT_SECRET = env.JWT_SECRET.trim();
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;

export interface JWTPayload {
  userId: string;
  email: string;
  role: "user" | "admin" | "employer";
}

// Convert expiresIn string to seconds
function expiresInToSeconds(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60; // Default 7 days

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 24 * 60 * 60;
    default:
      return 7 * 24 * 60 * 60;
  }
}

/**
 * Generate a JWT token (Edge Runtime compatible)
 */
export async function generateTokenEdge(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const expiresInSeconds = expiresInToSeconds(JWT_EXPIRES_IN);

  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(secret);

  return token;
}

/**
 * Verify a JWT token (Edge Runtime compatible)
 */
export async function verifyTokenEdge(token: string): Promise<JWTPayload> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    return payload as unknown as JWTPayload;
  } catch (error) {
    if (error instanceof Error) {
      if (env.NODE_ENV === "development") {
        console.error("[JWT Verification Error (Edge)]", error.message);
      }
    }
    throw new Error("Invalid or expired token");
  }
}

