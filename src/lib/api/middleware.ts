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

export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
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
      user: payload,
      error: null,
    };
  } catch (error: any) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }
}

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
