import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Offer from "@/lib/models/Offer";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { z } from "zod";

const updateOfferSchema = z.object({
  status: z.enum(["accepted", "rejected"]).optional(),
});

// GET - Get single offer
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

    const offer = await Offer.findById(id)
      .populate("employer", "name email profileImage company")
      .populate("applicant", "name email profileImage")
      .populate("application", "status")
      .populate("job", "title company")
      .lean();

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Verify user is either employer or applicant
    const isEmployer = offer.employer._id.toString() === authResult.user!.userId;
    const isApplicant = offer.applicant._id.toString() === authResult.user!.userId;

    if (!isEmployer && !isApplicant && authResult.user!.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ offer });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Update offer (accept/reject)
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
    const validatedData = updateOfferSchema.parse(body);

    const offer = await Offer.findById(id);

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Only applicant can accept/reject
    if (offer.applicant.toString() !== authResult.user!.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (offer.status !== "pending") {
      return NextResponse.json({ error: "Offer is no longer pending" }, { status: 400 });
    }

    // Update offer status
    offer.status = validatedData.status!;
    await offer.save();

    const populatedOffer = await Offer.findById(offer._id)
      .populate("employer", "name email profileImage company")
      .populate("applicant", "name email profileImage")
      .populate("application", "status")
      .populate("job", "title company")
      .lean();

    // Send notification to employer
    const io = (global as any).io;
    if (io) {
      const applicant = await (await import("@/lib/models/User")).default.findById(offer.applicant).lean();
      io.to(`user:${offer.employer.toString()}`).emit("notification", {
        title: `Offer ${validatedData.status === "accepted" ? "Accepted" : "Rejected"}`,
        message: `${applicant?.name || "Applicant"} has ${validatedData.status} your ${offer.type} offer`,
        type: validatedData.status === "accepted" ? "success" : "info",
        data: {
          offerId: offer._id.toString(),
        },
      });
    }

    // If accepted and there's an application, update it
    if (validatedData.status === "accepted" && offer.application) {
      const { Application } = await import("@/lib/models");
      await Application.findByIdAndUpdate(offer.application, {
        status: "accepted",
        reviewedAt: new Date(),
      });
    }

    return NextResponse.json({
      message: `Offer ${validatedData.status} successfully`,
      offer: populatedOffer,
    });
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
