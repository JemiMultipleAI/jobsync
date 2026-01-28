import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import Company from "@/lib/models/Company";
import { authenticateRequest, requireEmployer } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { z } from "zod";
import mongoose from "mongoose";

// GET - List all users in employer's company
export async function GET(request: NextRequest) {
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

    // Get employer's company
    const employer = await User.findById(authResult.user!.userId);
    if (!employer?.company) {
      return NextResponse.json(
        { error: "No company associated with your account" },
        { status: 400 }
      );
    }

    // Get all users in the company
    const companyUsers = await User.find({
      company: employer.company,
    })
      .select("-password")
      .populate("company", "name _id")
      .lean();

    return NextResponse.json({ users: companyUsers });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Add/invite user to company
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

    const employer = await User.findById(authResult.user!.userId);
    if (!employer?.company) {
      return NextResponse.json(
        { error: "No company associated with your account" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userId, email } = z
      .object({
        userId: z.string().optional(),
        email: z.string().email().optional(),
      })
      .parse(body);

    // Either add existing user or find by email
    let user;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } else if (email) {
      user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json(
          {
            error:
              "User with this email not found. They need to register first.",
          },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Either userId or email is required" },
        { status: 400 }
      );
    }

    // Check if user is already in a company
    if (user.company && user.company.toString() !== employer.company.toString()) {
      return NextResponse.json(
        {
          error: "User is already associated with another company",
        },
        { status: 400 }
      );
    }

    // Add user to company
    user.company = employer.company;
    await user.save();

    // Add to company members if not already there
    const company = await Company.findById(employer.company);
    if (company) {
      const userId = user._id as mongoose.Types.ObjectId;
      if (!company.members.some((id) => id.toString() === userId.toString())) {
        company.members.push(userId);
        await company.save();
      }
    }

    const populatedUser = await User.findById(user._id)
      .select("-password")
      .populate("company", "name _id")
      .lean();

    return NextResponse.json({
      message: "User added to company successfully",
      user: populatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
