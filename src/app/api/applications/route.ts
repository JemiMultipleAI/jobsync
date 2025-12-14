import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { Application, Job, Company } from "@/lib/models";
import { authenticateRequest } from "@/lib/api/middleware";
import { z } from "zod";

const createApplicationSchema = z.object({
  job: z.string().min(1, "Job ID is required"),
  coverLetter: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const query: any = { applicant: authResult.user!.userId };

    if (status && status !== "All") {
      query.status = status.toLowerCase().replace(" ", "-");
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate("job", "title company location type salary industry")
        .populate({
          path: "job",
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
  } catch (error: any) {
    console.error("Get applications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const body = await request.json();
    const validatedData = createApplicationSchema.parse(body);

    // Check if job exists
    const job = await Job.findById(validatedData.job);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: validatedData.job,
      applicant: authResult.user!.userId,
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }

    // Create application
    const application = await Application.create({
      job: validatedData.job,
      applicant: authResult.user!.userId,
      coverLetter: validatedData.coverLetter,
      status: "pending",
    });

    // Increment job's application count
    await Job.findByIdAndUpdate(validatedData.job, {
      $inc: { applicationCount: 1 },
    });

    const populatedApplication = await Application.findById(application._id)
      .populate("job", "title company location type salary industry")
      .populate({
        path: "job",
        populate: {
          path: "company",
          select: "name logo",
        },
      })
      .lean();

    return NextResponse.json(
      {
        message: "Application submitted successfully",
        application: populatedApplication,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }

    console.error("Create application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

