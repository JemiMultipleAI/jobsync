import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import { authenticateRequest, requireEmployer } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";

// GET - List all workers (users with role "user") for employers to browse
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    const employerError = requireEmployer(authResult.user);
    if (employerError) {
      return employerError;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const skills = searchParams.get("skills");

    // Build query - only users with role "user"
    const query: Record<string, unknown> = {
      role: "user",
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (skills) {
      query.skills = { $in: [new RegExp(skills, "i")] };
    }

    const skip = (page - 1) * limit;

    const [workers, total] = await Promise.all([
      User.find(query)
        .select("+taxFileNumber -password -passwordHistory -passwordResetToken -passwordResetExpires")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Include badges in the response (badges are already included in the user document)
    const workersWithBadges = (workers as any[]).map((worker) => ({
      ...worker,
      badges: worker.badges || [],
    }));

    return NextResponse.json({
      workers: workersWithBadges,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
