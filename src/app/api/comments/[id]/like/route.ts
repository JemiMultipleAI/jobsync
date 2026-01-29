import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Comment from "@/lib/models/Comment";
import { authenticateRequest } from "@/lib/api/middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    const { user } = authResult;
    const comment = await Comment.findById(params.id);

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    const userId = user._id.toString();
    const likesArray = comment.likes.map((id) => id.toString());

    if (likesArray.includes(userId)) {
      // Unlike
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // Like
      comment.likes.push(user._id);
    }

    await comment.save();

    return NextResponse.json({
      likes: comment.likes.length,
      isLiked: comment.likes.some((id) => id.toString() === userId),
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
