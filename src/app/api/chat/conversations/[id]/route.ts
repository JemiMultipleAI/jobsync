import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { Conversation, Message } from "@/lib/models/Chat";
import { authenticateRequest } from "@/lib/api/middleware";

export async function GET(
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
    const userId = authResult.user.userId;

    // Check if user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
      isDeleted: { $ne: true },
    })
      .populate("participants.userId", "name email profileImage role")
      .populate("createdBy", "name email profileImage")
      .lean();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const userId = authResult.user.userId;
    const body = await request.json();
    const { action, value } = body; // action: "archive" | "favorite" | "banner" | "delete" | "update"

    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const participantIndex = conversation.participants.findIndex(
      (p: any) => p.userId.toString() === userId
    );

    if (participantIndex === -1) {
      return NextResponse.json(
        { error: "Not a participant" },
        { status: 403 }
      );
    }

    if (action === "archive") {
      conversation.participants[participantIndex].isArchived = value !== false;
    } else if (action === "favorite") {
      conversation.participants[participantIndex].isFavorited = value !== false;
    } else if (action === "banner") {
      conversation.participants[participantIndex].isBanner = value !== false;
    } else if (action === "delete") {
      // Soft delete - mark as deleted for this user
      conversation.participants[participantIndex].isArchived = true;
      // Also mark conversation as deleted if all participants have archived
      const allArchived = conversation.participants.every(
        (p: any) => p.isArchived === true
      );
      if (allArchived) {
        conversation.isDeleted = true;
        conversation.deletedAt = new Date();
        conversation.deletedBy = userId;
      }
    } else if (action === "update") {
      // Update group chat details (only if user is admin)
      if (conversation.type === "group") {
        const participant = conversation.participants[participantIndex];
        if (participant.role === "admin" || conversation.createdBy.toString() === userId) {
          if (body.name !== undefined) conversation.name = body.name;
          if (body.description !== undefined) conversation.description = body.description;
          if (body.avatar !== undefined) conversation.avatar = body.avatar;
        } else {
          return NextResponse.json(
            { error: "Only admins can update group details" },
            { status: 403 }
          );
        }
      }
    }

    await conversation.save();

    const updatedConversation = await Conversation.findById(conversationId)
      .populate("participants.userId", "name email profileImage role")
      .populate("createdBy", "name email profileImage")
      .lean();

    return NextResponse.json({
      conversation: updatedConversation,
      message: "Conversation updated successfully",
    });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const userId = authResult.user.userId;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Check if user is admin or creator
    const participant = conversation.participants.find(
      (p: any) => p.userId.toString() === userId
    );
    const isAdmin = participant?.role === "admin" || conversation.createdBy.toString() === userId;

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only admins can delete conversations" },
        { status: 403 }
      );
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId });

    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);

    return NextResponse.json({
      message: "Conversation and all messages deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
