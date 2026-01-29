import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { Application, Job } from "@/lib/models";
import { authenticateRequest } from "@/lib/api/middleware";
import { z } from "zod";

const updateApplicationSchema = z.object({
  status: z
    .enum(["pending", "under_review", "shortlisted", "rejected", "accepted"])
    .optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const application = await Application.findById(id)
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
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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

    await connectDB();

    const body = await request.json();
    const validatedData = updateApplicationSchema.parse(body);

    const application = await Application.findById(id);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Check authorization: employers can update status for their company's jobs, users can withdraw their own
    const isApplicant = application.applicant.toString() === authResult.user!.userId;
    const isAdmin = authResult.user!.role === "admin";
    
    // For employers, check if they own the job's company
    let isEmployer = false;
    if (authResult.user!.role === "employer") {
      const job = await Job.findById(application.job).populate("company").lean();
      if (job && job.company) {
        const companyId = typeof job.company === 'object' && job.company !== null && '_id' in job.company
          ? job.company._id.toString()
          : job.company.toString();
        // Check if user's company matches job's company
        const userProfile = await import("@/lib/models/User").then(m => m.default.findById(authResult.user!.userId));
        if (userProfile && userProfile.company) {
          const userCompanyId = typeof userProfile.company === 'object' && userProfile.company !== null && '_id' in userProfile.company
            ? userProfile.company._id.toString()
            : userProfile.company.toString();
          isEmployer = companyId === userCompanyId;
        }
      }
    }

    // Only allow status updates if user is admin, employer (for their company's jobs), or applicant (to withdraw)
    if (validatedData.status) {
      if (!isAdmin && !isEmployer && !isApplicant) {
        return NextResponse.json(
          { error: "Unauthorized to update application status" },
          { status: 403 }
        );
      }
      // Applicants can only withdraw (set status to rejected or pending)
      if (isApplicant && !isAdmin && validatedData.status !== "rejected" && validatedData.status !== "pending") {
        return NextResponse.json(
          { error: "You can only withdraw your application" },
          { status: 403 }
        );
      }
    }

    // For other updates (notes), check authorization
    if (validatedData.notes !== undefined && !isAdmin && !isEmployer && !isApplicant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (validatedData.status) {
      updateData.status = validatedData.status;
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = authResult.user!.userId;
    }
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
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
      .populate("applicant", "name email")
      .lean();

    // Send WebSocket notification to applicant if status changed
    if (validatedData.status && updatedApplication) {
      const { sendNotification } = await import("@/lib/websocket/server");
      const applicantId = updatedApplication.applicant._id.toString();
      const statusLabels: Record<string, string> = {
        pending: "Pending",
        under_review: "Under Review",
        shortlisted: "Shortlisted",
        rejected: "Rejected",
        accepted: "Accepted",
      };
      
      sendNotification(applicantId, {
        title: "Application Status Updated",
        message: `Your application for ${updatedApplication.job.title} has been updated to ${statusLabels[validatedData.status]}`,
        type: validatedData.status === "accepted" ? "success" : "info",
        data: {
          applicationId: id,
          jobId: updatedApplication.job._id,
          status: validatedData.status,
        },
      });
    }

    return NextResponse.json({
      message: "Application updated successfully",
      application: updatedApplication,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const application = await Application.findById(id);

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

    await Application.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Application withdrawn successfully",
    });
  } catch (error) {
    console.error("Delete application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

