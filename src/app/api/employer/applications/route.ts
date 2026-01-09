import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { Application, Job } from "@/lib/models";
import User from "@/lib/models/User";
import { authenticateRequest, requireEmployer } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";

// GET - List all applications for employer's company jobs
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
    const status = searchParams.get("status");
    const jobId = searchParams.get("jobId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // First, get all jobs from employer's company
    const companyJobs = await Job.find({ company: employer.company })
      .select("_id")
      .lean();
    
    const companyJobIds = companyJobs.map((job) => job._id);

    if (companyJobIds.length === 0) {
      return NextResponse.json({
        applications: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }

    // Build query - only applications for jobs from employer's company
    const query: Record<string, unknown> = {
      job: { $in: companyJobIds },
    };

    if (status && status !== "all") {
      query.status = status;
    }

    if (jobId) {
      query.job = jobId;
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate("applicant", "name email profileImage resume")
        .populate({
          path: "job",
          select: "title company location type salary industry",
          populate: {
            path: "company",
            select: "name logo",
          },
        })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(query),
    ]);

    return NextResponse.json({
      applications,
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
