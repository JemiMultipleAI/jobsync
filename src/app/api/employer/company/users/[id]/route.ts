import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import Company from "@/lib/models/Company";
import { authenticateRequest, requireEmployer } from "@/lib/api/middleware";
import { handleApiError } from "@/lib/api/error-handler";

// DELETE - Remove user from company
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Prevent removing yourself
    if (id === authResult.user!.userId) {
      return NextResponse.json(
        { error: "You cannot remove yourself from the company" },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user || user.company?.toString() !== employer.company.toString()) {
      return NextResponse.json(
        { error: "User not found in your company" },
        { status: 404 }
      );
    }

    // Remove from company
    user.company = undefined;
    await user.save();

    // Remove from company members
    const company = await Company.findById(employer.company);
    if (company) {
      company.members = company.members.filter(
        (memberId) => memberId.toString() !== id
      );
      await company.save();
    }

    return NextResponse.json({
      message: "User removed from company successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
