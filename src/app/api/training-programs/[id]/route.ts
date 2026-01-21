import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import TrainingProgram from "@/lib/models/TrainingProgram";
import { authenticateRequest, requireAdmin } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { z } from "zod";

const programSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  content: z.string().optional(),
  duration: z.string().optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "All Levels"]).optional(),
  format: z.enum(["Online", "In-Person", "Hybrid"]).optional(),
  category: z.string().optional(),
  published: z.boolean().optional(),
  featuredImage: z.string().optional(),
  badgeName: z.string().optional(),
  badgeIcon: z.string().optional(),
  price: z.number().optional(),
  free: z.boolean().optional(),
});

// GET - Get single program
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

    const program = await TrainingProgram.findOne(query).lean();

    if (!program) {
      return NextResponse.json({ error: "Training program not found" }, { status: 404 });
    }

    return NextResponse.json({ program });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Update program (admin only)
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
    const validatedData = programSchema.parse(body);

    const program = await TrainingProgram.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).lean();

    if (!program) {
      return NextResponse.json({ error: "Training program not found" }, { status: 404 });
    }

    return NextResponse.json({ program });
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

// DELETE - Delete program (admin only)
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

    const program = await TrainingProgram.findByIdAndDelete(id);

    if (!program) {
      return NextResponse.json({ error: "Training program not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Training program deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
