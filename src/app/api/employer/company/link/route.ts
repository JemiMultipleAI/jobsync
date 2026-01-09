import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Company from "@/lib/models/Company";
import User from "@/lib/models/User";
import { authenticateRequest, requireEmployer } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { z } from "zod";
import mongoose from "mongoose";

const linkCompanySchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    const employerError = requireEmployer(authResult.user);
    if (employerError) {
      return employerError;
    }

    await connectDB();

    const body = await request.json();
    const { companyId } = linkCompanySchema.parse(body);

    // Get employer user
    const employer = await User.findById(authResult.user!.userId);
    if (!employer) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if employer already has a company
    if (employer.company) {
      return NextResponse.json(
        { error: "You are already linked to a company. Please contact support to change your company." },
        { status: 400 }
      );
    }

    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Link employer to company
    employer.company = company._id as mongoose.Types.ObjectId;
    await employer.save();

    // Add employer to company members if not already there
    const employerId = employer._id as mongoose.Types.ObjectId;
    if (!company.members.some((id) => id.toString() === employerId.toString())) {
      company.members.push(employerId);
      await company.save();
    }

    // Return populated company
    const populatedCompany = await Company.findById(company._id)
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .lean();

    return NextResponse.json({
      message: "Successfully linked to company",
      company: populatedCompany,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
