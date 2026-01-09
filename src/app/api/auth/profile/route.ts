import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import { authenticateRequest } from "@/lib/api/middleware";
import { z } from "zod";
import { handleApiError } from "@/lib/api/error-handler";
import { sanitizeString, sanitizeObject } from "@/lib/utils/sanitize";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const user = await User.findById(authResult.user!.userId)
      .select("-password")
      .populate("company", "name _id")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        skills: user.skills,
        profileImage: user.profileImage,
        resume: user.resume,
        profileCompletion: user.profileCompletion,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return authResult.error;
    }

    await connectDB();

    const body = await request.json();
    
    // Sanitize input
    const sanitizedBody = sanitizeObject(body, {
      fields: {
        name: "string",
        bio: "string",
        phone: "phone",
        location: "string",
      },
    });
    
    // Clean up empty strings - convert them to undefined so they're not sent to MongoDB
    const cleanedBody: Record<string, unknown> = {};
    if (sanitizedBody.name !== undefined && sanitizedBody.name !== "") cleanedBody.name = sanitizedBody.name;
    if (sanitizedBody.bio !== undefined) cleanedBody.bio = sanitizedBody.bio || undefined; // Allow empty bio
    if (sanitizedBody.phone !== undefined && sanitizedBody.phone !== "") cleanedBody.phone = sanitizedBody.phone;
    if (sanitizedBody.location !== undefined && sanitizedBody.location !== "") cleanedBody.location = sanitizedBody.location;
    if (sanitizedBody.skills !== undefined) {
      // Sanitize skills array
      cleanedBody.skills = Array.isArray(sanitizedBody.skills)
        ? sanitizedBody.skills.map((skill: unknown) => 
            typeof skill === "string" ? sanitizeString(skill) : skill
          )
        : sanitizedBody.skills;
    }

    const validatedData = updateProfileSchema.parse(cleanedBody);

    const user = await User.findByIdAndUpdate(
      authResult.user!.userId,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Recalculate profile completion
    if ('calculateProfileCompletion' in user && typeof (user as { calculateProfileCompletion: () => number }).calculateProfileCompletion === 'function') {
      user.profileCompletion = (user as { calculateProfileCompletion: () => number }).calculateProfileCompletion();
    }
    await user.save();

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        skills: user.skills,
        profileImage: user.profileImage,
        resume: user.resume,
        profileCompletion: user.profileCompletion,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

