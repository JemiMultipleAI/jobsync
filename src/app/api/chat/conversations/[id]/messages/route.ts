import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { Conversation, Message } from "@/lib/models/Chat";
import { authenticateRequest } from "@/lib/api/middleware";
import mongoose from "mongoose";

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
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before"); // Message ID to fetch messages before

    // Verify user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
      isDeleted: { $ne: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Build query
    let query: any = {
      conversationId,
      isDeleted: { $ne: true },
    };

    if (before) {
      const beforeMessage = await Message.findById(before);
      if (beforeMessage) {
        query.createdAt = { $lt: beforeMessage.createdAt };
      }
    }

    const messages = await Message.find(query)
      .populate("senderId", "name email profileImage role")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Update last read timestamp
    const participantIndex = conversation.participants.findIndex(
      (p: any) => p.userId.toString() === userId
    );
    if (participantIndex !== -1) {
      conversation.participants[participantIndex].lastReadAt = new Date();
      await conversation.save();
    }

    return NextResponse.json({
      messages: messages.reverse(), // Return in chronological order
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

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
    const userId = authResult.user.userId;
    const body = await request.json();
    const { content, attachments } = body;

    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        { error: "Message content or attachments required" },
        { status: 400 }
      );
    }

    // Verify user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
      isDeleted: { $ne: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Create message
    const message = await Message.create({
      conversationId,
      senderId: userId,
      content: content?.trim() || undefined,
      attachments: attachments || [],
    });

    // Update conversation's last message
    conversation.lastMessage = message._id as mongoose.Types.ObjectId;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Populate and return
    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email profileImage role")
      .lean();

    return NextResponse.json(
      { message: populatedMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
