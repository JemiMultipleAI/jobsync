import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get token from cookie (server-side can read httpOnly cookies)
    const token = request.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "No token found" },
        { status: 401 }
      );
    }

    // Return token for WebSocket authentication
    return NextResponse.json({ token });
  } catch (error) {
    return handleApiError(error);
  }
}
