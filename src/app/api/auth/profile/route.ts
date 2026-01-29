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
  resume: z.string().url().optional().or(z.literal("")),
  bankDetails: z.object({
    accountName: z.string().min(1).optional(),
    bsb: z.union([
      z.string().regex(/^\d{6}$/, "BSB must be exactly 6 digits"),
      z.literal("")
    ]).optional(),
    accountNumber: z.string().min(1).optional(),
  }).passthrough().optional(),
  superannuation: z.object({
    fundName: z.string().min(1).optional(),
    memberNumber: z.string().min(1).optional(),
    usi: z.string().optional(),
  }).passthrough().optional(),
  taxFileNumber: z.union([
    z.string().regex(/^\d{9}$/, "Tax File Number must be exactly 9 digits"),
    z.literal("")
  ]).optional(),
  preferences: z.object({
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    profileVisibility: z.string().optional(),
    jobAlerts: z.boolean().optional(),
    applicationAlerts: z.boolean().optional(),
    darkMode: z.boolean().optional(),
    language: z.string().optional(),
  }).passthrough().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      console.error("Authentication failed:", authResult.error);
      return authResult.error;
    }

    if (!authResult.user || !authResult.user.userId) {
      console.error("No user in auth result");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get user - try to include taxFileNumber but handle if it fails
    let user;
    try {
      // First try with taxFileNumber
      user = await User.findById(authResult.user.userId)
        .select("+taxFileNumber -password -passwordHistory -passwordResetToken -passwordResetExpires")
        .populate("company", "name _id")
        .lean();
    } catch (selectError) {
      // If selecting taxFileNumber fails, try without it
      console.warn("Failed to select taxFileNumber, trying without it:", selectError);
      try {
        user = await User.findById(authResult.user.userId)
          .select("-password -passwordHistory -passwordResetToken -passwordResetExpires")
          .populate("company", "name _id")
          .lean();
      } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
          { 
            error: "Failed to fetch user profile",
            message: error instanceof Error ? error.message : "Unknown error"
          },
          { status: 500 }
        );
      }
    }

    if (!user) {
      console.error("User not found for ID:", authResult.user.userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract badges from the badges array (if it exists)
    const badges = (user as any).badges || [];

    // Ensure all fields have proper defaults
    const userResponse = {
      _id: String(user._id),
      id: String(user._id),
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      company: user.company || null,
      bio: user.bio || null,
      phone: user.phone || null,
      location: user.location || null,
      skills: Array.isArray(user.skills) ? user.skills : [],
      profileImage: user.profileImage || null,
      resume: user.resume || null,
      profileCompletion: typeof user.profileCompletion === "number" ? user.profileCompletion : 0,
      bankDetails: (user as any).bankDetails || null,
      superannuation: (user as any).superannuation || null,
      taxFileNumber: (user as any).taxFileNumber || null,
      preferences: (user as any).preferences || {},
      enrolledTrainingPrograms: Array.isArray((user as any).enrolledTrainingPrograms) 
        ? (user as any).enrolledTrainingPrograms 
        : [],
      completedTrainingPrograms: Array.isArray((user as any).completedTrainingPrograms)
        ? (user as any).completedTrainingPrograms
        : [],
      badges: Array.isArray(badges) ? badges : [],
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    };

    return NextResponse.json({
      user: userResponse,
      preferences: userResponse.preferences,
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("[Profile Update] Starting PUT request");
    
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      console.error("[Profile Update] Authentication failed");
      return authResult.error;
    }

    console.log("[Profile Update] User authenticated:", authResult.user?.userId);

    try {
      await connectDB();
      console.log("[Profile Update] Database connected");
    } catch (dbError) {
      console.error("[Profile Update] Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed", message: "Unable to connect to database" },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
      console.log("[Profile Update] Request body parsed");
    } catch (parseError) {
      console.error("[Profile Update] JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid request body", message: "Failed to parse JSON" },
        { status: 400 }
      );
    }
    
    // Log incoming data for debugging
    console.log("[Profile Update] Received data:", JSON.stringify(body, null, 2));
    
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
    // Only include bankDetails if it has at least one non-empty field
    if (sanitizedBody.bankDetails !== undefined && sanitizedBody.bankDetails !== null) {
      const bankDetails = sanitizedBody.bankDetails as Record<string, unknown> | undefined;
      if (bankDetails && typeof bankDetails === "object") {
        const cleanedBankDetails: Record<string, unknown> = {};
        let hasAnyField = false;
        
        if (typeof bankDetails.accountName === "string" && bankDetails.accountName.trim() !== "") {
          cleanedBankDetails.accountName = bankDetails.accountName.trim();
          hasAnyField = true;
        }
        if (typeof bankDetails.bsb === "string" && bankDetails.bsb.trim() !== "") {
          cleanedBankDetails.bsb = bankDetails.bsb.trim();
          hasAnyField = true;
        }
        if (typeof bankDetails.accountNumber === "string" && bankDetails.accountNumber.trim() !== "") {
          cleanedBankDetails.accountNumber = bankDetails.accountNumber.trim();
          hasAnyField = true;
        }
        
        // Only include bankDetails if at least one field has a value
        if (hasAnyField && Object.keys(cleanedBankDetails).length > 0) {
          cleanedBody.bankDetails = cleanedBankDetails;
        }
      }
    }
    
    // Only include superannuation if it has at least one non-empty field
    if (sanitizedBody.superannuation !== undefined && sanitizedBody.superannuation !== null) {
      const superannuation = sanitizedBody.superannuation as Record<string, unknown> | undefined;
      if (superannuation && typeof superannuation === "object") {
        const cleanedSuperannuation: Record<string, unknown> = {};
        let hasAnyField = false;
        
        if (typeof superannuation.fundName === "string" && superannuation.fundName.trim() !== "") {
          cleanedSuperannuation.fundName = superannuation.fundName.trim();
          hasAnyField = true;
        }
        if (typeof superannuation.memberNumber === "string" && superannuation.memberNumber.trim() !== "") {
          cleanedSuperannuation.memberNumber = superannuation.memberNumber.trim();
          hasAnyField = true;
        }
        if (typeof superannuation.usi === "string" && superannuation.usi.trim() !== "") {
          cleanedSuperannuation.usi = superannuation.usi.trim();
          hasAnyField = true;
        }
        
        // Only include superannuation if at least one field has a value
        if (hasAnyField && Object.keys(cleanedSuperannuation).length > 0) {
          cleanedBody.superannuation = cleanedSuperannuation;
        }
      }
    }
    // Only include taxFileNumber if it's not empty
    if (sanitizedBody.taxFileNumber !== undefined) {
      const tfn = typeof sanitizedBody.taxFileNumber === "string" ? sanitizedBody.taxFileNumber.trim() : "";
      if (tfn !== "") {
        cleanedBody.taxFileNumber = tfn;
      }
    }
    // Handle preferences - ensure it's an object and preserve all fields
    if (sanitizedBody.preferences !== undefined && sanitizedBody.preferences !== null) {
      if (typeof sanitizedBody.preferences === "object" && !Array.isArray(sanitizedBody.preferences)) {
        cleanedBody.preferences = sanitizedBody.preferences;
      }
    }
    if (sanitizedBody.resume !== undefined && sanitizedBody.resume !== "") {
      cleanedBody.resume = sanitizedBody.resume;
    }

    // Log cleaned data before validation
    console.log("[Profile Update] Cleaned data:", JSON.stringify(cleanedBody, null, 2));
    
    let validatedData;
    try {
      validatedData = updateProfileSchema.parse(cleanedBody);
      console.log("[Profile Update] Validation passed");
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("[Profile Update] Validation error:", JSON.stringify(error.errors, null, 2));
        return NextResponse.json(
          { 
            error: "Validation error", 
            message: "Please check the form fields for errors",
            details: error.errors.map(e => ({
              path: e.path.join("."),
              message: e.message
            }))
          },
          { status: 400 }
        );
      }
      console.error("[Profile Update] Unexpected validation error:", error);
      throw error;
    }

    console.log("[Profile Update] Updating user with data:", JSON.stringify(validatedData, null, 2));
    
    // Update the user - use only exclusion projection (MongoDB doesn't allow mixing inclusion/exclusion)
    const user = await User.findByIdAndUpdate(
      authResult.user!.userId,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).select("-password -passwordHistory -passwordResetToken -passwordResetExpires");

    if (!user) {
      console.error("[Profile Update] User not found:", authResult.user!.userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Recalculate profile completion
    try {
      if ('calculateProfileCompletion' in user && typeof (user as { calculateProfileCompletion: () => number }).calculateProfileCompletion === 'function') {
        user.profileCompletion = (user as { calculateProfileCompletion: () => number }).calculateProfileCompletion();
      }
      await user.save();
      console.log("[Profile Update] Profile saved successfully");
    } catch (saveError) {
      console.error("[Profile Update] Error saving user:", saveError);
      return NextResponse.json(
        { 
          error: "Failed to save profile",
          message: saveError instanceof Error ? saveError.message : "Database error"
        },
        { status: 500 }
      );
    }
    
    // Fetch taxFileNumber separately if it was updated (since we can't mix inclusion/exclusion in select)
    let taxFileNumber: string | null = null;
    if (validatedData.taxFileNumber !== undefined) {
      try {
        const userWithTFN = await User.findById(authResult.user!.userId)
          .select("taxFileNumber")
          .lean();
        taxFileNumber = (userWithTFN as any)?.taxFileNumber || null;
      } catch (tfnError) {
        console.warn("[Profile Update] Could not fetch taxFileNumber:", tfnError);
        // Continue without taxFileNumber
      }
    } else {
      // If taxFileNumber wasn't updated, get it from the user object if available
      taxFileNumber = (user as any).taxFileNumber || null;
    }

    try {
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
          bankDetails: (user as any).bankDetails || null,
          superannuation: (user as any).superannuation || null,
          taxFileNumber: taxFileNumber,
          preferences: (user as any).preferences || {},
          updatedAt: user.updatedAt,
        },
      });
    } catch (responseError) {
      console.error("[Profile Update] Error building response:", responseError);
      return NextResponse.json(
        { error: "Failed to build response", message: responseError instanceof Error ? responseError.message : "Unknown error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Profile Update] Unhandled error:", error);
    console.error("[Profile Update] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Validation error", 
          message: "Please check the form fields for errors",
          details: error.errors.map(e => ({
            path: e.path.join("."),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }
    
    // Return detailed error in development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        {
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        },
        { status: 500 }
      );
    }
    
    return handleApiError(error);
  }
}

