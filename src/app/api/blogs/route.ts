import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Blog from "@/lib/models/Blog";
import { authenticateRequest } from "@/lib/api/middleware";
import { z } from "zod";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title cannot exceed 200 characters"),
  content: z.string().min(1, "Content is required"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const authorId = searchParams.get("authorId");
    const skip = (page - 1) * limit;

    const query: any = { published: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (authorId) {
      query.author = authorId;
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate("author", "name email profileImage role")
        .populate("company", "name logo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query),
    ]);

    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
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
    if (!user || (user.role !== "user" && user.role !== "employer")) {
      return NextResponse.json(
        { error: "Unauthorized. Only users and employers can create blogs." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = blogSchema.parse({
      title: (body.title || "").trim(),
      content: (body.content || "").trim(),
      imageUrl: body.imageUrl || "",
      tags: body.tags || [],
    });

    // Get user's company if they're an employer
    let companyId = null;
    if (user.role === "employer" && user.company) {
      companyId = user.company;
    }

    const blog = await Blog.create({
      title: validatedData.title,
      content: validatedData.content,
      author: user._id,
      authorType: user.role === "employer" ? "employer" : "user",
      company: companyId,
      imageUrl: validatedData.imageUrl || undefined,
      tags: validatedData.tags,
      published: true,
    });

    const populatedBlog = await Blog.findById(blog._id)
      .populate("author", "name email profileImage role")
      .populate("company", "name logo")
      .lean();

    return NextResponse.json(
      { blog: populatedBlog, message: "Blog created successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}
