import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Company from "@/lib/models/Company";
import User from "@/lib/models/User";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { z } from "zod";
import mongoose from "mongoose";

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

    const query: Record<string, unknown> = {};

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
  } catch (error) {
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

    // Allow both admins and employers to create companies
    if (authResult.user!.role !== "admin" && authResult.user!.role !== "employer") {
      return NextResponse.json(
        { error: "Admin or employer access required" },
        { status: 403 }
      );
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
    const userId = new mongoose.Types.ObjectId(authResult.user!.userId);
    const company = await Company.create({
      ...validatedData,
      createdBy: userId,
      members: [userId], // Add creator as first member
    });

    // If created by employer, link them to the company
    if (authResult.user!.role === "employer") {
      await User.findByIdAndUpdate(userId, {
        company: company._id,
      });
    }

    const populatedCompany = await Company.findById(company._id)
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .lean();

    return NextResponse.json(
      {
        message: "Company created successfully",
        company: populatedCompany,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

