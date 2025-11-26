import jwt from "jsonwebtoken";

// Trim whitespace and newlines from JWT_SECRET to avoid issues
const JWT_SECRET = (process.env.JWT_SECRET || "your-secret-key-change-in-production").trim();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "user" | "admin";
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error: any) {
    // Log the actual error for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("[JWT Verification Error]", error.message);
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

