import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import Company from "@/lib/models/Company";
import { authenticateRequest, requireAdmin } from "@/lib/api/middleware";
import { z } from "zod";
import { handleApiError } from "@/lib/api/error-handler";
import mongoose from "mongoose";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["user", "admin", "employer"]).optional(),
  company: z.string().optional().or(z.literal("")),
  bio: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    // Only admins can view user details
    const adminError = requireAdmin(authResult.user);
    if (adminError) {
      return adminError;
    }

    await connectDB();

    const user = await User.findById(id)
      .select("-password")
      .populate("company", "name _id")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
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

    // Only admins can update users
    const adminError = requireAdmin(authResult.user);
    if (adminError) {
      return adminError;
    }

    await connectDB();

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Get current user to check existing company
    const currentUser = await User.findById(id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const oldCompanyId = currentUser.company?.toString();
    const newCompanyId = validatedData.company || null;

    // Handle company linking/unlinking
    if (oldCompanyId !== newCompanyId) {
      // Remove from old company members if exists
      if (oldCompanyId) {
        const oldCompany = await Company.findById(oldCompanyId);
        if (oldCompany) {
          oldCompany.members = oldCompany.members.filter(
            (memberId) => memberId.toString() !== id
          );
          await oldCompany.save();
        }
      }

      // Add to new company members if provided
      if (newCompanyId) {
        const newCompany = await Company.findById(newCompanyId);
        if (!newCompany) {
          return NextResponse.json(
            { error: "Company not found" },
            { status: 404 }
          );
        }
        
        // Add user to company members if not already there
        const userId = currentUser._id as mongoose.Types.ObjectId;
        if (!newCompany.members.some((id) => id.toString() === userId.toString())) {
          newCompany.members.push(userId);
          await newCompany.save();
        }
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = { ...validatedData };
    if (newCompanyId === null || newCompanyId === "") {
      updateData.company = undefined;
    } else {
      updateData.company = newCompanyId;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Recalculate profile completion
    if ('calculateProfileCompletion' in user && typeof (user as unknown as { calculateProfileCompletion: () => number }).calculateProfileCompletion === 'function') {
      user.profileCompletion = (user as unknown as { calculateProfileCompletion: () => number }).calculateProfileCompletion();
    }
    await user.save();

    return NextResponse.json({
      message: "User updated successfully",
      user,
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

    // Only admins can delete users
    const adminError = requireAdmin(authResult.user);
    if (adminError) {
      return adminError;
    }

    await connectDB();

    // Prevent deleting yourself
    if (id === authResult.user!.userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

