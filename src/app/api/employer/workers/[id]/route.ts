import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import { authenticateRequest, requireEmployer } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";

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

    const employerError = requireEmployer(authResult.user);
    if (employerError) {
      return employerError;
    }

    await connectDB();

    const worker = await User.findById(id)
      .select("-password -passwordHistory -passwordResetToken -passwordResetExpires")
      .populate("enrolledTrainingPrograms.program", "title badgeName")
      .lean();

    if (!worker || worker.role !== "user") {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

    // Format badges from enrolled training programs
    const badges = (worker.enrolledTrainingPrograms || [])
      .filter((enrollment: any) => enrollment.completedAt && enrollment.badgeAwarded)
      .map((enrollment: any) => ({
        trainingProgramId: enrollment.program?._id?.toString() || "",
        badgeName: enrollment.program?.badgeName || "Training Completed",
        completedAt: enrollment.completedAt,
      }));

    return NextResponse.json({
      worker: {
        ...worker,
        badges,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
