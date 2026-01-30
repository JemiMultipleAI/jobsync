import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface ICertificate {
  name: string;
  url: string;
  uploadedAt: Date;
}

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
  certificates: ICertificate[];
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
    certificates: {
      type: [{
        name: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      }],
      default: [],
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

// Calculate profile completion - 6 sections
UserSchema.methods.calculateProfileCompletion = function (): number {
  let completion = 0;

  // 1. Profile Picture (17%)
  if (!!this.profileImage && this.profileImage.trim().length > 0) {
    completion += 17;
  }

  // 2. Personal Information - name, phone, and location (17%)
  const hasName = !!this.name && this.name.trim().length > 0;
  const hasPhone = !!this.phone && this.phone.trim().length > 0;
  const hasLocation = !!this.location && this.location.trim().length > 0;
  if (hasName && hasPhone && hasLocation) {
    completion += 17;
  }

  // 3. Professional Summary - bio (16%)
  if (!!this.bio && this.bio.trim().length > 0) {
    completion += 16;
  }

  // 4. Skills (17%)
  if (Array.isArray(this.skills) && this.skills.length > 0) {
    completion += 17;
  }

  // 5. Resume/CV (17%)
  if (!!this.resume && this.resume.trim().length > 0) {
    completion += 17;
  }

  // 6. Certificates/Licences (16%)
  if (Array.isArray(this.certificates) && this.certificates.length > 0) {
    completion += 16;
  }

  // Ensure completion is between 0 and 100
  return Math.min(100, Math.max(0, completion));
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

