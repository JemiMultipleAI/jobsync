import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import TrainingProgram from "@/lib/models/TrainingProgram";
import User from "@/lib/models/User";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";

// POST - Mark training program as completed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();
    const { id } = await params;

    const program = await TrainingProgram.findById(id);
    if (!program) {
      return NextResponse.json({ error: "Training program not found" }, { status: 404 });
    }

    const user = await User.findById(authResult.user!.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if enrolled
    if (!program.enrolledUsers.includes(user._id)) {
      return NextResponse.json({ error: "Not enrolled in this program" }, { status: 400 });
    }

    // Check if already completed
    if (program.completedUsers.includes(user._id)) {
      return NextResponse.json({ error: "Already completed this program" }, { status: 400 });
    }

    // Add to completed users
    program.completedUsers.push(user._id);
    await program.save();

    // Add to user's completed programs
    if (!user.completedTrainingPrograms) {
      user.completedTrainingPrograms = [];
    }
    if (!user.completedTrainingPrograms.includes(program._id)) {
      user.completedTrainingPrograms.push(program._id);
    }

    // Add badge if program has one
    if (program.badgeName) {
      if (!user.badges) {
        user.badges = [];
      }
      // Check if badge already exists
      const badgeExists = user.badges.some(
        (badge) => badge.trainingProgramId.toString() === program._id.toString()
      );
      if (!badgeExists) {
        user.badges.push({
          trainingProgramId: program._id,
          badgeName: program.badgeName,
          badgeIcon: program.badgeIcon,
          completedAt: new Date(),
        });
      }
    }

    await user.save();

    return NextResponse.json({
      message: "Training program completed successfully",
      badge: program.badgeName ? {
        name: program.badgeName,
        icon: program.badgeIcon,
      } : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
