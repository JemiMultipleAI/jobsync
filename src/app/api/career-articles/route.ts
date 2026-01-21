import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import CareerArticle from "@/lib/models/CareerArticle";
import { authenticateRequest, requireAdmin } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { z } from "zod";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required").max(500, "Excerpt cannot exceed 500 characters"),
  category: z.enum(["Resume Tips", "Interview Tips", "Networking", "Career Growth", "Industry Insights", "Other"]),
  author: z.string().optional(),
  published: z.boolean().optional(),
  featuredImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET - List all published articles (public) or all articles (admin)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const admin = searchParams.get("admin") === "true";

    // Check if user is admin
    let isAdmin = false;
    try {
      const authResult = await authenticateRequest(request);
      if (!authResult.error && authResult.user?.role === "admin") {
        isAdmin = true;
      }
    } catch {
      // Not authenticated or not admin - continue as public user
    }

    const query: Record<string, unknown> = {};

    // Only show published articles to non-admins
    if (!isAdmin || !admin) {
      query.published = true;
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      CareerArticle.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CareerArticle.countDocuments(query),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create new article (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    const adminError = requireAdmin(authResult.user);
    if (adminError) {
      return adminError;
    }

    await connectDB();

    const body = await request.json();
    const validatedData = articleSchema.parse(body);

    const article = await CareerArticle.create({
      ...validatedData,
      author: validatedData.author || "JobSync Team",
      published: validatedData.published ?? false,
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}
