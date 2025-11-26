import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";
import { authenticateRequest } from "@/lib/api/middleware";
import { z } from "zod";

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

    const user = await User.findById(authResult.user!.userId).select(
      "-password"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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
    
    // Clean up empty strings - convert them to undefined so they're not sent to MongoDB
    const cleanedBody: any = {};
    if (body.name !== undefined && body.name !== "") cleanedBody.name = body.name;
    if (body.bio !== undefined) cleanedBody.bio = body.bio || undefined; // Allow empty bio
    if (body.phone !== undefined && body.phone !== "") cleanedBody.phone = body.phone;
    if (body.location !== undefined && body.location !== "") cleanedBody.location = body.location;
    if (body.skills !== undefined) cleanedBody.skills = body.skills;

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
    user.profileCompletion = (user as any).calculateProfileCompletion();
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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

