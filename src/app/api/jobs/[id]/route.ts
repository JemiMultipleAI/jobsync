import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Job from "@/lib/models/Job";
import Company from "@/lib/models/Company";
import User from "@/lib/models/User";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const job = await Job.findById(id)
      .populate("company", "name logo industry location description website")
      .populate("postedBy", "name email")
      .lean();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    // Allow both admins and employers to update jobs
    if (authResult.user!.role !== "admin" && authResult.user!.role !== "employer") {
      return NextResponse.json(
        { error: "Admin or employer access required" },
        { status: 403 }
      );
    }

    await connectDB();

    // Check if job exists
    const existingJob = await Job.findById(id);
    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // If employer, verify they own the company
    if (authResult.user!.role === "employer") {
      const employer = await User.findById(authResult.user!.userId);
      if (!employer?.company || employer.company.toString() !== existingJob.company.toString()) {
        return NextResponse.json(
          { error: "You can only update jobs from your own company" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validatedData = updateJobSchema.parse(body);

    // Prevent employers from changing company (if company field is present in body)
    if (authResult.user!.role === "employer" && body.company && body.company !== existingJob.company.toString()) {
      return NextResponse.json(
        { error: "You cannot change the company for a job" },
        { status: 403 }
      );
    }

    const job = await Job.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    )
      .populate("company", "name logo industry location")
      .populate("postedBy", "name email")
      .lean();

    return NextResponse.json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    // Allow both admins and employers to delete jobs
    if (authResult.user!.role !== "admin" && authResult.user!.role !== "employer") {
      return NextResponse.json(
        { error: "Admin or employer access required" },
        { status: 403 }
      );
    }

    await connectDB();

    // Check if job exists
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // If employer, verify they own the company
    if (authResult.user!.role === "employer") {
      const employer = await User.findById(authResult.user!.userId);
      if (!employer?.company || employer.company.toString() !== job.company.toString()) {
        return NextResponse.json(
          { error: "You can only delete jobs from your own company" },
          { status: 403 }
        );
      }
    }

    // Delete job
    await Job.findByIdAndDelete(id);

    // Decrement company's openJobs count
    await Company.findByIdAndUpdate(job.company, {
      $inc: { openJobs: -1 },
    });

    return NextResponse.json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

