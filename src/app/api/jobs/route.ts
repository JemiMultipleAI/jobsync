import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Job from "@/lib/models/Job";
import Company from "@/lib/models/Company";
import User from "@/lib/models/User";
import { authenticateRequest } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { validateObjectId, validatePagination } from "@/lib/api/validation";
import { rateLimit, rateLimitConfigs } from "@/lib/api/rate-limit";
import { logRequest } from "@/lib/api/request-logger";
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
  type: z.enum(["full-time", "part-time", "contract", "temporary", "casual"]),
  industry: z.string().min(1, "Industry is required"),
  experienceLevel: z.enum(["entry", "mid", "senior", "executive"]).optional(),
  image: z.string().optional(),
});

/**
 * GET /api/jobs
 * Retrieves a paginated list of jobs with optional filtering
 * @param request - The NextRequest object
 * @returns NextResponse with jobs array and pagination info
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const rateLimitError = rateLimit(request, rateLimitConfigs.read);
    if (rateLimitError) {
      logRequest(request, rateLimitError, startTime);
      return rateLimitError;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = validatePagination(
      searchParams.get("page"),
      searchParams.get("limit"),
      100 // Max 100 items per page
    );
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

    const response = NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

    logRequest(request, response, startTime);
    return response;
  } catch (error) {
    const response = handleApiError(error);
    logRequest(request, response, startTime, undefined, error instanceof Error ? error.message : String(error));
    return response;
  }
}

/**
 * POST /api/jobs
 * Creates a new job posting
 * Requires admin or employer authentication
 * @param request - The NextRequest object
 * @returns NextResponse with created job data
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const rateLimitError = rateLimit(request, rateLimitConfigs.standard);
    if (rateLimitError) {
      logRequest(request, rateLimitError, startTime);
      return rateLimitError;
    }

    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      logRequest(request, authResult.error, startTime);
      return authResult.error;
    }

    // Allow both admins and employers to create jobs
    if (authResult.user!.role !== "admin" && authResult.user!.role !== "employer") {
      const response = NextResponse.json(
        { error: "Admin or employer access required" },
        { status: 403 }
      );
      logRequest(request, response, startTime, authResult.user.userId);
      return response;
    }

    await connectDB();

    const body = await request.json();
    const validatedData = createJobSchema.parse(body);

    // Validate company ID format
    const companyIdError = validateObjectId(validatedData.company, "Company ID");
    if (companyIdError) {
      logRequest(request, companyIdError, startTime, authResult.user.userId);
      return companyIdError;
    }

    // Verify company exists
    const company = await Company.findById(validatedData.company);
    if (!company) {
      const response = NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
      logRequest(request, response, startTime, authResult.user.userId);
      return response;
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

    const response = NextResponse.json(
      {
        message: "Job created successfully",
        job: populatedJob,
      },
      { status: 201 }
    );

    logRequest(request, response, startTime, authResult.user.userId);
    return response;
  } catch (error) {
    const response = handleApiError(error);
    logRequest(request, response, startTime, undefined, error instanceof Error ? error.message : String(error));
    return response;
  }
}

