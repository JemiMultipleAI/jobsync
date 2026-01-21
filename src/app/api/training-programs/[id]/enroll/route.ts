import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import TrainingProgram from "@/lib/models/TrainingProgram";
import User from "@/lib/models/User";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";

// POST - Enroll user in training program
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

    if (!program.published) {
      return NextResponse.json({ error: "Training program is not available" }, { status: 400 });
    }

    const user = await User.findById(authResult.user!.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already enrolled
    if (program.enrolledUsers.includes(user._id)) {
      return NextResponse.json({ error: "Already enrolled in this program" }, { status: 400 });
    }

    // Add user to enrolled users
    program.enrolledUsers.push(user._id);
    await program.save();

    // Add to user's enrolled programs
    if (!user.enrolledTrainingPrograms) {
      user.enrolledTrainingPrograms = [];
    }
    if (!user.enrolledTrainingPrograms.includes(program._id)) {
      user.enrolledTrainingPrograms.push(program._id);
      await user.save();
    }

    return NextResponse.json({ message: "Successfully enrolled in training program", program });
  } catch (error) {
    return handleApiError(error);
  }
}
