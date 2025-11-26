import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Company from "@/lib/models/Company";
import { authenticateRequest, requireAdmin } from "@/lib/api/middleware";
import { z } from "zod";

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  industry: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  website: z.string().url().optional().or(z.literal("")),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  employees: z.string().optional(),
  established: z.number().optional(),
  verified: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const company = await Company.findById(params.id)
      .populate("createdBy", "name email")
      .lean();

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ company });
  } catch (error: any) {
    console.error("Get company error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    // Only admins can update companies
    const adminError = requireAdmin(authResult.user);
    if (adminError) {
      return adminError;
    }

    await connectDB();

    const body = await request.json();
    const validatedData = updateCompanySchema.parse(body);

    const company = await Company.findByIdAndUpdate(
      params.id,
      { $set: validatedData },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .lean();

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Company updated successfully",
      company,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Update company error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    // Only admins can delete companies
    const adminError = requireAdmin(authResult.user);
    if (adminError) {
      return adminError;
    }

    await connectDB();

    const company = await Company.findByIdAndDelete(params.id);

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Company deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete company error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

