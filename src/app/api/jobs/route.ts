import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Job from "@/lib/models/Job";
import Company from "@/lib/models/Company";
import User from "@/lib/models/User";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { z } from "zod";

const createJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company ID is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.array(z.string()).default([]),
  location: z.string().min(1, "Location is required"),
  salary: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().default("AUD"),
      period: z.enum(["year", "month", "hour"]).default("year"),
    })
    .optional(),
  type: z.enum(["full-time", "part-time", "contract", "temporary"]),
  industry: z.string().min(1, "Industry is required"),
  experienceLevel: z.enum(["entry", "mid", "senior", "executive"]).optional(),
  image: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "active";
    const industry = searchParams.get("industry");
    const location = searchParams.get("location");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = { status };

    if (industry) {
      query.industry = industry;
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("company", "name logo industry location")
        .populate("postedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(query),
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get jobs error:", error);
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

    // Allow both admins and employers to create jobs
    if (authResult.user!.role !== "admin" && authResult.user!.role !== "employer") {
      return NextResponse.json(
        { error: "Admin or employer access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const validatedData = createJobSchema.parse(body);

    // Verify company exists
    const company = await Company.findById(validatedData.company);
    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // If employer, verify they own the company
    if (authResult.user!.role === "employer") {
      const employer = await User.findById(authResult.user!.userId);
      if (!employer?.company || employer.company.toString() !== validatedData.company) {
        return NextResponse.json(
          { error: "You can only create jobs for your own company" },
          { status: 403 }
        );
      }
    }

    // Create job
    const job = await Job.create({
      ...validatedData,
      postedBy: authResult.user!.userId,
    });

    // Increment company's openJobs count
    await Company.findByIdAndUpdate(validatedData.company, {
      $inc: { openJobs: 1 },
    });

    const populatedJob = await Job.findById(job._id)
      .populate("company", "name logo industry location")
      .populate("postedBy", "name email")
      .lean();

    return NextResponse.json(
      {
        message: "Job created successfully",
        job: populatedJob,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

