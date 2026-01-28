import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Company from "@/lib/models/Company";
import User from "@/lib/models/User";
import { authenticateRequest, requireAdmin } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const company = await Company.findById(id)
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .lean();

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ company });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    // Check if company exists
    const company = await Company.findById(id);
    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Allow admins or employers who are linked to this company
    if (authResult.user!.role === "admin") {
      // Admins can update any company
    } else if (authResult.user!.role === "employer") {
      // Employers can only update their own company
      const employer = await User.findById(authResult.user!.userId);
      if (!employer || employer.company?.toString() !== id) {
        return NextResponse.json(
          { error: "You can only update your own company" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Admin or employer access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateCompanySchema.parse(body);

    // Only admins can update verified status
    if (authResult.user!.role !== "admin" && "verified" in validatedData) {
      delete validatedData.verified;
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .lean();

    return NextResponse.json({
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const company = await Company.findByIdAndDelete(id);

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("Delete company error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

