import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import SavedJob from "@/lib/models/SavedJob";
import { authenticateRequest } from "@/lib/api/middleware";
import { z } from "zod";

const saveJobSchema = z.object({
  job: z.string().min(1, "Job ID is required"),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    const [savedJobs, total] = await Promise.all([
      SavedJob.find({ user: authResult.user!.userId })
        .populate("job", "title company location type salary industry image createdAt")
        .populate({
          path: "job",
          populate: {
            path: "company",
            select: "name logo",
          },
        })
        .sort({ savedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SavedJob.countDocuments({ user: authResult.user!.userId }),
    ]);

    return NextResponse.json({
      savedJobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get saved jobs error:", error);
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
    const validatedData = saveJobSchema.parse(body);

    // Check if already saved
    const existingSavedJob = await SavedJob.findOne({
      user: authResult.user!.userId,
      job: validatedData.job,
    });

    if (existingSavedJob) {
      return NextResponse.json(
        { error: "Job is already saved" },
        { status: 400 }
      );
    }

    // Create saved job
    const savedJob = await SavedJob.create({
      user: authResult.user!.userId,
      job: validatedData.job,
    });

    const populatedSavedJob = await SavedJob.findById(savedJob._id)
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
        message: "Job saved successfully",
        savedJob: populatedSavedJob,
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
        { error: "Job is already saved" },
        { status: 400 }
      );
    }

    console.error("Save job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const savedJob = await SavedJob.findOneAndDelete({
      user: authResult.user!.userId,
      job: jobId,
    });

    if (!savedJob) {
      return NextResponse.json(
        { error: "Saved job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Job removed from saved",
    });
  } catch (error: any) {
    console.error("Delete saved job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

