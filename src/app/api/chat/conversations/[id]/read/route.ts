import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { Conversation } from "@/lib/models/Chat";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";

// POST - Mark conversation as read
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const authResult = await authenticateRequest(request);

    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": authResult.user.userId,
      isDeleted: { $ne: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Update lastReadAt for the current user
    const participant = conversation.participants.find(
      (p) => p.userId.toString() === authResult.user.userId
    );

    if (participant) {
      participant.lastReadAt = new Date();
      await conversation.save();
    }

    return NextResponse.json({ message: "Conversation marked as read" });
  } catch (error) {
    return handleApiError(error);
  }
}
