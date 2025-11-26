import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Job from "@/lib/models/Job";
import Company from "@/lib/models/Company";
import { authenticateRequest, requireAdmin } from "@/lib/api/middleware";
import { z } from "zod";

const updateJobSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  requirements: z.array(z.string()).optional(),
  location: z.string().min(1).optional(),
  salary: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().optional(),
      period: z.enum(["year", "month", "hour"]).optional(),
    })
    .optional(),
  type: z.enum(["full-time", "part-time", "contract", "temporary"]).optional(),
  status: z.enum(["active", "closed", "draft"]).optional(),
  industry: z.string().min(1).optional(),
  experienceLevel: z.enum(["entry", "mid", "senior", "executive"]).optional(),
  image: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const job = await Job.findById(params.id)
      .populate("company", "name logo industry location description website")
      .populate("postedBy", "name email")
      .lean();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error: any) {
    console.error("Get job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    // Only admins can update jobs
    const adminError = requireAdmin(authResult.user);
    if (adminError) {
      return adminError;
    }

    await connectDB();

    const body = await request.json();
    const validatedData = updateJobSchema.parse(body);

    const job = await Job.findByIdAndUpdate(
      params.id,
      { $set: validatedData },
      { new: true, runValidators: true }
    )
      .populate("company", "name logo industry location")
      .populate("postedBy", "name email")
      .lean();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Job updated successfully",
      job,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Update job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    // Only admins can delete jobs
    const adminError = requireAdmin(authResult.user);
    if (adminError) {
      return adminError;
    }

    await connectDB();

    const job = await Job.findByIdAndDelete(params.id);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Decrement company's openJobs count
    await Company.findByIdAndUpdate(job.company, {
      $inc: { openJobs: -1 },
    });

    return NextResponse.json({
      message: "Job deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

