import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Blog from "@/lib/models/Blog";
import { authenticateRequest } from "@/lib/api/middleware";
import { z } from "zod";

const blogUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const blog = await Blog.findById(params.id)
      .populate("author", "name email profileImage role")
      .populate("company", "name logo")
      .lean();

    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    // Increment views
    await Blog.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Check if user is the author
    if (String(blog.author) !== String(user._id)) {
      return NextResponse.json(
        { error: "Unauthorized. You can only edit your own blogs." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = blogUpdateSchema.parse(body);

    Object.assign(blog, validatedData);
    await blog.save();

    const updatedBlog = await Blog.findById(blog._id)
      .populate("author", "name email profileImage role")
      .populate("company", "name logo")
      .lean();

    return NextResponse.json({
      blog: updatedBlog,
      message: "Blog updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if user is the author
    if (String(blog.author) !== String(user._id)) {
      return NextResponse.json(
        { error: "Unauthorized. You can only delete your own blogs." },
        { status: 403 }
      );
    }

    await Blog.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
