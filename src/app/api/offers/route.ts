import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Offer from "@/lib/models/Offer";
import { Application } from "@/lib/models";
import { authenticateRequest, requireEmployer } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { z } from "zod";

const createOfferSchema = z.object({
  type: z.enum(["interview", "trial", "job"]),
  applicantId: z.string(),
  applicationId: z.string().optional(),
  jobId: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  scheduledDate: z.string().optional(),
  location: z.string().optional(),
  trialDuration: z.number().optional(),
  salary: z
    .object({
      amount: z.number(),
      currency: z.string(),
      period: z.string(),
    })
    .optional(),
  expiresAt: z.string().optional(),
});

// GET - List offers (for user or employer)
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = authResult.user!.role;
    const status = searchParams.get("status");

    let query: Record<string, unknown> = {};

    if (role === "employer") {
      query.employer = authResult.user!.userId;
    } else if (role === "user") {
      query.applicant = authResult.user!.userId;
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (status) {
      query.status = status;
    }

    const offers = await Offer.find(query)
      .populate("employer", "name email profileImage company")
      .populate("applicant", "name email profileImage")
      .populate("application", "status")
      .populate("job", "title company")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ offers });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create offer
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = createOfferSchema.parse(body);

    // Check if applicant exists
    const User = (await import("@/lib/models/User")).default;
    const applicant = await User.findById(validatedData.applicantId);
    if (!applicant || applicant.role !== "user") {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    // If applicationId provided, verify it exists and belongs to employer's company
    if (validatedData.applicationId) {
      const application = await Application.findById(validatedData.applicationId)
        .populate("job")
        .lean();
      
      if (!application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
      }

      // Verify employer owns the job's company
      const employer = await User.findById(authResult.user!.userId);
      if (employer?.company) {
        const job = application.job as any;
        if (job.company.toString() !== employer.company.toString()) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
      }
    }

    // Create offer
    const offer = await Offer.create({
      type: validatedData.type,
      employer: authResult.user!.userId,
      applicant: validatedData.applicantId,
      application: validatedData.applicationId,
      job: validatedData.jobId,
      message: validatedData.message,
      scheduledDate: validatedData.scheduledDate ? new Date(validatedData.scheduledDate) : undefined,
      location: validatedData.location,
      trialDuration: validatedData.trialDuration,
      salary: validatedData.salary,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
      status: "pending",
    });

    const populatedOffer = await Offer.findById(offer._id)
      .populate("employer", "name email profileImage company")
      .populate("applicant", "name email profileImage")
      .populate("application", "status")
      .populate("job", "title company")
      .lean();

    // Send WebSocket notification to applicant
    const io = (global as any).io;
    if (io) {
      const offerTypeLabels = {
        interview: "Interview Invitation",
        trial: "Trial Period Offer",
        job: "Job Offer",
      };
      
      io.to(`user:${validatedData.applicantId}`).emit("notification", {
        title: offerTypeLabels[validatedData.type],
        message: validatedData.message,
        type: "success",
        data: {
          offerId: offer._id.toString(),
          type: validatedData.type,
        },
      });
    }

    // If there's an application, update its status based on offer type
    if (validatedData.applicationId) {
      let newStatus = "under_review";
      if (validatedData.type === "job") {
        newStatus = "accepted";
      } else if (validatedData.type === "interview") {
        newStatus = "shortlisted";
      }

      await Application.findByIdAndUpdate(validatedData.applicationId, {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: authResult.user!.userId,
      });
    }

    return NextResponse.json(
      {
        message: "Offer sent successfully",
        offer: populatedOffer,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}
