import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import CareerArticle from "@/lib/models/CareerArticle";
import { authenticateRequest, requireAdmin } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { z } from "zod";

const articleSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().min(1).max(500).optional(),
  category: z.enum(["Resume Tips", "Interview Tips", "Networking", "Career Growth", "Industry Insights", "Other"]).optional(),
  author: z.string().optional(),
  published: z.boolean().optional(),
  featuredImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET - Get single article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Check if user is admin
    let isAdmin = false;
    try {
      const authResult = await authenticateRequest(request);
      if (!authResult.error && authResult.user?.role === "admin") {
        isAdmin = true;
      }
    } catch {
      // Not authenticated or not admin
    }

    const query: Record<string, unknown> = { _id: id };
    if (!isAdmin) {
      query.published = true;
    }

    const article = await CareerArticle.findOne(query).lean();

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Increment views
    await CareerArticle.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return NextResponse.json({ article });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Update article (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const body = await request.json();
    const validatedData = articleSchema.parse(body);

    const article = await CareerArticle.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).lean();

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}

// DELETE - Delete article (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const article = await CareerArticle.findByIdAndDelete(id);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
