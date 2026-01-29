import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Comment from "@/lib/models/Comment";
import { authenticateRequest } from "@/lib/api/middleware";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Comment is required").max(1000, "Comment cannot exceed 1000 characters"),
  blog: z.string().optional(),
  successStory: z.string().optional(),
  parentComment: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get("blog");
    const successStoryId = searchParams.get("successStory");
    const parentCommentId = searchParams.get("parentComment");

    const query: any = {};
    if (blogId) query.blog = blogId;
    if (successStoryId) query.successStory = successStoryId;
    if (parentCommentId) {
      query.parentComment = parentCommentId;
    } else {
      query.parentComment = { $exists: false };
    }

    const comments = await Comment.find(query)
      .populate("author", "name email profileImage role")
      .populate("parentComment")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    const { user } = authResult;
    const body = await request.json();
    const validatedData = commentSchema.parse({
      content: (body.content || "").trim(),
      blog: body.blog,
      successStory: body.successStory,
      parentComment: body.parentComment,
    });

    if (!validatedData.blog && !validatedData.successStory) {
      return NextResponse.json(
        { error: "Either blog or successStory must be provided" },
        { status: 400 }
      );
    }

    const comment = await Comment.create({
      content: validatedData.content,
      author: user._id,
      blog: validatedData.blog || undefined,
      successStory: validatedData.successStory || undefined,
      parentComment: validatedData.parentComment || undefined,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "name email profileImage role")
      .lean();

    return NextResponse.json(
      { comment: populatedComment, message: "Comment added successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
