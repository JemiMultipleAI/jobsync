import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import TrainingProgram from "@/lib/models/TrainingProgram";
import { authenticateRequest, requireAdmin } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { z } from "zod";

const programSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().optional(),
  duration: z.string().min(1, "Duration is required"),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "All Levels"]),
  format: z.enum(["Online", "In-Person", "Hybrid"]),
  category: z.string().min(1, "Category is required"),
  published: z.boolean().optional(),
  featuredImage: z.string().optional(),
  badgeName: z.string().optional(),
  badgeIcon: z.string().optional(),
  price: z.number().optional(),
  free: z.boolean().optional(),
});

// GET - List all published programs (public) or all programs (admin)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const level = searchParams.get("level");
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
      // Not authenticated or not admin
    }

    const query: Record<string, unknown> = {};

    // Only show published programs to non-admins
    if (!isAdmin || !admin) {
      query.published = true;
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (level && level !== "All") {
      query.level = level;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [programs, total] = await Promise.all([
      TrainingProgram.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TrainingProgram.countDocuments(query),
    ]);

    return NextResponse.json({
      programs,
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

// POST - Create new program (admin only)
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
    const validatedData = programSchema.parse(body);

    const program = await TrainingProgram.create({
      ...validatedData,
      published: validatedData.published ?? false,
      free: validatedData.free ?? true,
      price: validatedData.price ?? 0,
    });

    return NextResponse.json({ program }, { status: 201 });
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
