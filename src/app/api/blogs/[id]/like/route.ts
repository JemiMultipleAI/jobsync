import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Blog from "@/lib/models/Blog";
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
    const blog = await Blog.findById(params.id);

    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    const userId = user._id.toString();
    const likesArray = blog.likes.map((id) => id.toString());

    if (likesArray.includes(userId)) {
      // Unlike
      blog.likes = blog.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // Like
      blog.likes.push(user._id);
    }

    await blog.save();

    return NextResponse.json({
      likes: blog.likes.length,
      isLiked: blog.likes.some((id) => id.toString() === userId),
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
