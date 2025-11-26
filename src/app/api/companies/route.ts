import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Company from "@/lib/models/Company";
import { authenticateRequest, requireAdmin } from "@/lib/api/middleware";
import { z } from "zod";

const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().min(1, "Description is required"),
  industry: z.string().min(1, "Industry is required"),
  location: z.string().min(1, "Location is required"),
  website: z.string().url().optional().or(z.literal("")),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  employees: z.string().optional(),
  established: z.number().optional(),
  verified: z.boolean().default(false),
  rating: z.number().min(0).max(5).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const industry = searchParams.get("industry");
    const location = searchParams.get("location");
    const verified = searchParams.get("verified");
    const search = searchParams.get("search");

    const query: any = {};

    if (industry) {
      query.industry = industry;
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (verified !== null) {
      query.verified = verified === "true";
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      Company.find(query)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(query),
    ]);

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get companies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    // Only admins can create companies
    const adminError = requireAdmin(authResult.user);
    if (adminError) {
      return adminError;
    }

    await connectDB();

    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    // Check if company name already exists
    const existingCompany = await Company.findOne({
      name: validatedData.name,
    });
    if (existingCompany) {
      return NextResponse.json(
        { error: "Company with this name already exists" },
        { status: 400 }
      );
    }

    // Create company
    const company = await Company.create({
      ...validatedData,
      createdBy: authResult.user!.userId,
    });

    const populatedCompany = await Company.findById(company._id)
      .populate("createdBy", "name email")
      .lean();

    return NextResponse.json(
      {
        message: "Company created successfully",
        company: populatedCompany,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Company with this name already exists" },
        { status: 400 }
      );
    }

    console.error("Create company error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

