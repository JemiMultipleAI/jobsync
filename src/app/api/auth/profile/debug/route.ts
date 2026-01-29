import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/middleware";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";

export async function GET(request: NextRequest) {
  try {
    console.log("=== Profile Debug Endpoint ===");
    
    // Test authentication
    const authResult = await authenticateRequest(request);
    console.log("Auth result:", {
      hasUser: !!authResult.user,
      hasError: !!authResult.error,
      userId: authResult.user?.userId,
    });
    
    if (authResult.error) {
      return NextResponse.json({
        step: "authentication",
        error: "Authentication failed",
        details: await authResult.error.json(),
      });
    }

    if (!authResult.user || !authResult.user.userId) {
      return NextResponse.json({
        step: "authentication",
        error: "No user in auth result",
      });
    }

    // Test database connection
    console.log("Testing database connection...");
    await connectDB();
    console.log("Database connected");

    // Test user fetch
    console.log("Fetching user with ID:", authResult.user.userId);
    const user = await User.findById(authResult.user.userId)
      .select("-password")
      .lean();
    
    console.log("User found:", {
      exists: !!user,
      hasName: !!user?.name,
      hasEmail: !!user?.email,
    });

    if (!user) {
      return NextResponse.json({
        step: "user_fetch",
        error: "User not found",
        userId: authResult.user.userId,
      });
    }

    return NextResponse.json({
      success: true,
      step: "complete",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      step: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
