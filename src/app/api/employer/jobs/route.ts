import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Job from "@/lib/models/Job";
import User from "@/lib/models/User";
import { authenticateRequest, requireEmployer } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";

// GET - List all jobs for employer's company
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

    // Get employer's company
    const employer = await User.findById(authResult.user!.userId);
    if (!employer?.company) {
      return NextResponse.json(
        { error: "No company associated with your account" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build query - only jobs from employer's company
    const query: Record<string, unknown> = {
      company: employer.company,
    };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("company", "name logo industry location")
        .populate("postedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(query),
    ]);

    return NextResponse.json({
      jobs,
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
