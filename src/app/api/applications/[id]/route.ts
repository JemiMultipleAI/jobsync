import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Application from "@/lib/models/Application";
import Job from "@/lib/models/Job";
import { authenticateRequest, requireAdmin } from "@/lib/api/middleware";
import { z } from "zod";

const updateApplicationSchema = z.object({
  status: z
    .enum(["pending", "under-review", "shortlisted", "rejected", "accepted"])
    .optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const application = await Application.findById(params.id)
      .populate("job", "title company location type salary industry description")
      .populate({
        path: "job",
        populate: {
          path: "company",
          select: "name logo description",
        },
      })
      .populate("applicant", "name email")
      .lean();

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Check if user owns this application or is admin
    if (
      application.applicant._id.toString() !== authResult.user!.userId &&
      authResult.user!.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({ application });
  } catch (error: any) {
    console.error("Get application error:", error);
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

    await connectDB();

    const body = await request.json();
    const validatedData = updateApplicationSchema.parse(body);

    const application = await Application.findById(params.id);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Only admins can update application status
    if (validatedData.status && authResult.user!.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can update application status" },
        { status: 403 }
      );
    }

    // Users can only update their own applications (e.g., withdraw)
    if (
      application.applicant.toString() !== authResult.user!.userId &&
      authResult.user!.role !== "admin"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updateData: any = {};
    if (validatedData.status) {
      updateData.status = validatedData.status;
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = authResult.user!.userId;
    }
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    )
      .populate("job", "title company location type salary industry")
      .populate({
        path: "job",
        populate: {
          path: "company",
          select: "name logo",
        },
      })
      .lean();

    return NextResponse.json({
      message: "Application updated successfully",
      application: updatedApplication,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Update application error:", error);
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

    await connectDB();

    const application = await Application.findById(params.id);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Users can only delete their own applications
    if (
      application.applicant.toString() !== authResult.user!.userId &&
      authResult.user!.role !== "admin"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Decrement job's application count
    await Job.findByIdAndUpdate(application.job, {
      $inc: { applicationCount: -1 },
    });

    await Application.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: "Application withdrawn successfully",
    });
  } catch (error: any) {
    console.error("Delete application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

