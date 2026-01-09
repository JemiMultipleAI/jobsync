import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "employer";
  company?: mongoose.Types.ObjectId; // Reference to Company (for employer role)
  bio?: string;
  phone?: string;
  location?: string;
  skills: string[];
  profileImage?: string;
  resume?: string;
  profileCompletion: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["user", "admin", "employer"],
      default: "user",
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    profileImage: {
      type: String,
    },
    resume: {
      type: String,
    },
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // Update profile completion if other fields changed
    if (this.isModified() && !this.isNew) {
      if ('calculateProfileCompletion' in this && typeof (this as unknown as { calculateProfileCompletion: () => number }).calculateProfileCompletion === 'function') {
        this.profileCompletion = (this as unknown as { calculateProfileCompletion: () => number }).calculateProfileCompletion();
      }
    }
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    // Update profile completion
    if (!this.isNew) {
      this.profileCompletion = (this as unknown as { calculateProfileCompletion: () => number }).calculateProfileCompletion();
    }
    next();
  } catch (error: unknown) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate profile completion
UserSchema.methods.calculateProfileCompletion = function (): number {
  // Explicitly check each field to ensure proper detection
  const fieldChecks = [
    !!this.name && this.name.trim().length > 0, // Name is required and should be non-empty
    !!this.email && this.email.trim().length > 0, // Email is required and should be non-empty
    !!this.bio && this.bio.trim().length > 0, // Bio is optional
    !!this.phone && this.phone.trim().length > 0, // Phone is optional
    !!this.location && this.location.trim().length > 0, // Location is optional
    Array.isArray(this.skills) && this.skills.length > 0, // Skills array should exist and have items
    !!this.profileImage && this.profileImage.trim().length > 0, // Profile image is optional
    !!this.resume && this.resume.trim().length > 0, // Resume is optional
  ];

  const completedFields = fieldChecks.filter(Boolean).length;
  const totalFields = fieldChecks.length;
  const completion = Math.round((completedFields / totalFields) * 100);

  // Ensure completion is between 0 and 100
  return Math.min(100, Math.max(0, completion));
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

