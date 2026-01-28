import jwt from "jsonwebtoken";
import { env } from "@/lib/config/env";

// Trim whitespace and newlines from JWT_SECRET to avoid issues
const JWT_SECRET = env.JWT_SECRET.trim();
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;

export interface JWTPayload {
  userId: string;
  email: string;
  role: "user" | "admin" | "employer";
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload as object, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string | number,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    // Log the actual error for debugging
    if (error instanceof Error) {
      if (env.NODE_ENV === "development") {
        console.error("[JWT Verification Error]", error.message);
      }
    }
    throw new Error("Invalid or expired token");
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

