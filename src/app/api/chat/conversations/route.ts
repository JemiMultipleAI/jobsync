import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { Conversation, Message } from "@/lib/models/Chat";
import { authenticateRequest } from "@/lib/api/middleware";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authResult = await authenticateRequest(request);

    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authResult.user.userId;
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter"); // "all" | "archived" | "favorited" | "banner"

    // Build query based on filter
    let participantQuery: any = {
      "participants.userId": userId,
      isDeleted: { $ne: true },
    };

    if (filter === "archived") {
      participantQuery["participants.isArchived"] = true;
    } else if (filter === "favorited") {
      participantQuery["participants.isFavorited"] = true;
    } else if (filter === "banner") {
      participantQuery["participants.isBanner"] = true;
    } else {
      // For "all", exclude archived unless specifically requested
      participantQuery["participants.isArchived"] = { $ne: true };
    }

    const conversations = await Conversation.find(participantQuery)
      .populate("participants.userId", "name email profileImage role")
      .populate("lastMessage")
      .populate("createdBy", "name email profileImage")
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    // Format conversations with participant info
    const formattedConversations = conversations.map((conv: any) => {
      const currentUserParticipant = conv.participants.find(
        (p: any) => p.userId._id.toString() === userId
      );
      const otherParticipants = conv.participants.filter(
        (p: any) => p.userId._id.toString() !== userId
      );

      return {
        _id: conv._id,
        type: conv.type,
        name: conv.name || (conv.type === "direct" && otherParticipants[0]?.userId?.name) || "Unknown",
        description: conv.description,
        avatar: conv.avatar || (conv.type === "direct" && otherParticipants[0]?.userId?.profileImage),
        participants: otherParticipants.map((p: any) => ({
          _id: p.userId._id,
          name: p.userId.name,
          email: p.userId.email,
          profileImage: p.userId.profileImage,
          role: p.userId.role,
          participantRole: p.role,
        })),
        currentUserParticipant: currentUserParticipant ? {
          isArchived: currentUserParticipant.isArchived,
          isFavorited: currentUserParticipant.isFavorited,
          isBanner: currentUserParticipant.isBanner,
          role: currentUserParticipant.role,
          lastReadAt: currentUserParticipant.lastReadAt,
        } : null,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    });

    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authResult = await authenticateRequest(request);

    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, participantIds, name, description, avatar } = body;

    if (!type || !participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: "Type and participantIds are required" },
        { status: 400 }
      );
    }

    // For direct chats, ensure exactly 2 participants
    if (type === "direct" && participantIds.length !== 1) {
      return NextResponse.json(
        { error: "Direct chat requires exactly one other participant" },
        { status: 400 }
      );
    }

    // Check if direct chat already exists
    if (type === "direct") {
      const existingConversation = await Conversation.findOne({
        type: "direct",
        "participants.userId": { $all: [authResult.user.userId, participantIds[0]] },
        isDeleted: { $ne: true },
      });

      if (existingConversation) {
        return NextResponse.json({
          conversation: existingConversation,
          message: "Conversation already exists",
        });
      }
    }

    // Create conversation with all participants
    const allParticipantIds = [authResult.user.userId, ...participantIds];
    const participants = allParticipantIds.map((id, index) => ({
      userId: id,
      role: index === 0 ? "admin" : "member", // Creator is admin
      joinedAt: new Date(),
    }));

    const conversation = await Conversation.create({
      type,
      participants,
      name: type === "group" ? name : undefined,
      description: type === "group" ? description : undefined,
      avatar: type === "group" ? avatar : undefined,
      createdBy: authResult.user.userId,
    });

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants.userId", "name email profileImage role")
      .populate("createdBy", "name email profileImage")
      .lean();

    return NextResponse.json(
      { conversation: populatedConversation, message: "Conversation created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
