import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromRequest } from "../auth/jwt";
import connectDB from "../db/connect";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: "user" | "admin" | "employer";
  };
}

/**
 * Authenticates a request by verifying the JWT token
 * @param request - The NextRequest object
 * @returns Object with authenticated user or error response
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<
  | { user: { userId: string; email: string; role: "user" | "admin" | "employer" }; error: null }
  | { user: null; error: NextResponse }
> {
  try {
    // Connect to database
    await connectDB();

    // Get token from cookie or Authorization header
    const token =
      request.cookies.get("token")?.value ||
      getTokenFromRequest(request);

    if (!token) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        ),
      };
    }

    // Verify token
    const payload = verifyToken(token);

    return {
      user: payload as { userId: string; email: string; role: "user" | "admin" | "employer" },
      error: null,
    };
  } catch {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }
}

/**
 * Checks if the user has admin role
 * @param user - The authenticated user object
 * @returns NextResponse with error if not admin, null if admin
 */
export function requireAdmin(
  user: { role: string } | null
): NextResponse | null {
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Checks if the user has employer role
 * @param user - The authenticated user object
 * @returns NextResponse with error if not employer, null if employer
 */
export function requireEmployer(
  user: { role: string } | null
): NextResponse | null {
  if (!user || user.role !== "employer") {
    return NextResponse.json(
      { error: "Employer access required" },
      { status: 403 }
    );
  }
  return null;
}
