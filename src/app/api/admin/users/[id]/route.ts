import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import Company from "@/lib/models/Company";
import { authenticateRequest, requireAdmin } from "@/lib/api/middleware";
import { z } from "zod";
import { handleApiError } from "@/lib/api/error-handler";
import { validateObjectId } from "@/lib/api/validation";
import { withTransaction } from "@/lib/db/transaction";
import { rateLimit, rateLimitConfigs } from "@/lib/api/rate-limit";
import { logRequest } from "@/lib/api/request-logger";
import mongoose from "mongoose";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["user", "admin", "employer"]).optional(),
  company: z.string().optional().or(z.literal("")),
  bio: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
});

/**
 * GET /api/admin/users/[id]
 * Retrieves a specific user by ID
 * Requires admin authentication
 * @param request - The NextRequest object
 * @param params - Route parameters containing user ID
 * @returns NextResponse with user data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  
  try {
    const { id } = await params;
    
    // Validate ObjectId format
    const idError = validateObjectId(id, "User ID");
    if (idError) {
      logRequest(request, idError, startTime);
      return idError;
    }

    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      logRequest(request, authResult.error, startTime);
      return authResult.error;
    }

    // Only admins can view user details
    const adminError = requireAdmin(authResult.user);
    if (adminError) {
      logRequest(request, adminError, startTime, authResult.user.userId);
      return adminError;
    }

    await connectDB();

    const user = await User.findById(id)
      .select("-password")
      .populate("company", "name _id")
      .lean();

    if (!user) {
      const response = NextResponse.json({ error: "User not found" }, { status: 404 });
      logRequest(request, response, startTime, authResult.user.userId);
      return response;
    }

    const response = NextResponse.json({ user });
    logRequest(request, response, startTime, authResult.user.userId);
    return response;
  } catch (error) {
    const response = handleApiError(error);
    logRequest(request, response, startTime, undefined, error instanceof Error ? error.message : String(error));
    return response;
  }
}

/**
 * PUT /api/admin/users/[id]
 * Updates a user's information
 * Requires admin authentication
 * Uses transactions to ensure atomic company member updates
 * @param request - The NextRequest object
 * @param params - Route parameters containing user ID
 * @returns NextResponse with updated user data
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  
  try {
    const { id } = await params;
    
    // Rate limiting
    const rateLimitError = rateLimit(request, rateLimitConfigs.standard);
    if (rateLimitError) {
      logRequest(request, rateLimitError, startTime);
      return rateLimitError;
    }

    // Validate ObjectId format
    const idError = validateObjectId(id, "User ID");
    if (idError) {
      logRequest(request, idError, startTime);
      return idError;
    }

    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      logRequest(request, authResult.error, startTime);
      return authResult.error;
    }

    // Only admins can update users
    const adminError = requireAdmin(authResult.user);
    if (adminError) {
      logRequest(request, adminError, startTime, authResult.user.userId);
      return adminError;
    }

    await connectDB();

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Validate company ID if provided
    if (validatedData.company && validatedData.company !== "") {
      const companyIdError = validateObjectId(validatedData.company, "Company ID");
      if (companyIdError) {
        logRequest(request, companyIdError, startTime, authResult.user.userId);
        return companyIdError;
      }
    }

    // Use transaction for atomic company member updates
    const result = await withTransaction(async (session) => {
      // Get current user to check existing company
      const currentUser = await User.findById(id).session(session);
      if (!currentUser) {
        throw new Error("User not found");
      }

      const oldCompanyId = currentUser.company?.toString();
      const newCompanyId = validatedData.company || null;

      // Handle company linking/unlinking
      if (oldCompanyId !== newCompanyId) {
        // Remove from old company members if exists
        if (oldCompanyId) {
          const oldCompany = await Company.findById(oldCompanyId).session(session);
          if (oldCompany) {
            oldCompany.members = oldCompany.members.filter(
              (memberId) => memberId.toString() !== id
            );
            await oldCompany.save({ session });
          }
        }

        // Add to new company members if provided
        if (newCompanyId) {
          const newCompany = await Company.findById(newCompanyId).session(session);
          if (!newCompany) {
            throw new Error("Company not found");
          }
          
          // Add user to company members if not already there
          const userId = currentUser._id as mongoose.Types.ObjectId;
          if (!newCompany.members.some((id) => id.toString() === userId.toString())) {
            newCompany.members.push(userId);
            await newCompany.save({ session });
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
        { new: true, runValidators: true, session }
      ).select("-password");

      if (!user) {
        throw new Error("User not found");
      }

      // Recalculate profile completion
      if ('calculateProfileCompletion' in user && typeof (user as unknown as { calculateProfileCompletion: () => number }).calculateProfileCompletion === 'function') {
        user.profileCompletion = (user as unknown as { calculateProfileCompletion: () => number }).calculateProfileCompletion();
      }
      await user.save({ session });

      return user;
    });

    const response = NextResponse.json({
      message: "User updated successfully",
      user: result,
    });

    logRequest(request, response, startTime, authResult.user.userId);
    return response;
  } catch (error) {
    const response = handleApiError(error);
    logRequest(request, response, startTime, undefined, error instanceof Error ? error.message : String(error));
    return response;
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Deletes a user account
 * Requires admin authentication
 * Prevents self-deletion
 * @param request - The NextRequest object
 * @param params - Route parameters containing user ID
 * @returns NextResponse with success message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  
  try {
    const { id } = await params;
    
    // Validate ObjectId format
    const idError = validateObjectId(id, "User ID");
    if (idError) {
      logRequest(request, idError, startTime);
      return idError;
    }

    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      logRequest(request, authResult.error, startTime);
      return authResult.error;
    }

    // Only admins can delete users
    const adminError = requireAdmin(authResult.user);
    if (adminError) {
      logRequest(request, adminError, startTime, authResult.user.userId);
      return adminError;
    }

    await connectDB();

    // Prevent deleting yourself
    if (id === authResult.user!.userId) {
      const response = NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
      logRequest(request, response, startTime, authResult.user.userId);
      return response;
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      const response = NextResponse.json({ error: "User not found" }, { status: 404 });
      logRequest(request, response, startTime, authResult.user.userId);
      return response;
    }

    const response = NextResponse.json({
      message: "User deleted successfully",
    });

    logRequest(request, response, startTime, authResult.user.userId);
    return response;
  } catch (error) {
    const response = handleApiError(error);
    logRequest(request, response, startTime, undefined, error instanceof Error ? error.message : String(error));
    return response;
  }
}

