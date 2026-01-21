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
  preferences?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    profileVisibility?: string;
    jobAlerts?: boolean;
    applicationAlerts?: boolean;
    darkMode?: boolean;
    language?: string;
  };
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordHistory?: string[]; // Store hashed previous passwords
  enrolledTrainingPrograms?: mongoose.Types.ObjectId[]; // References to enrolled training programs
  completedTrainingPrograms?: mongoose.Types.ObjectId[]; // References to completed training programs
  badges?: Array<{
    trainingProgramId: mongoose.Types.ObjectId;
    badgeName: string;
    badgeIcon?: string;
    completedAt: Date;
  }>;
  bankDetails?: {
    accountName: string;
    bsb: string; // Bank State Branch (6 digits for Australian banks)
    accountNumber: string;
  };
  superannuation?: {
    fundName: string;
    memberNumber: string;
    usi?: string; // Unique Superannuation Identifier
  };
  taxFileNumber?: string; // Australian Tax File Number (9 digits)
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
    preferences: {
      type: {
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: false },
        profileVisibility: { type: String, default: "public" },
        jobAlerts: { type: Boolean, default: true },
        applicationAlerts: { type: Boolean, default: true },
        darkMode: { type: Boolean, default: false },
        language: { type: String, default: "en" },
      },
      default: {},
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordHistory: {
      type: [String],
      default: [],
      select: false,
    },
    enrolledTrainingPrograms: [{
      type: Schema.Types.ObjectId,
      ref: "TrainingProgram",
    }],
    completedTrainingPrograms: [{
      type: Schema.Types.ObjectId,
      ref: "TrainingProgram",
    }],
    badges: [{
      trainingProgramId: {
        type: Schema.Types.ObjectId,
        ref: "TrainingProgram",
        required: true,
      },
      badgeName: {
        type: String,
        required: true,
      },
      badgeIcon: {
        type: String,
      },
      completedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    bankDetails: {
      accountName: {
        type: String,
        trim: true,
      },
      bsb: {
        type: String,
        trim: true,
        validate: {
          validator: function(v: string) {
            // Only validate if BSB is provided and not empty
            if (!v || v === "") return true;
            return /^\d{6}$/.test(v);
          },
          message: "BSB must be exactly 6 digits",
        },
      },
      accountNumber: {
        type: String,
        trim: true,
      },
    },
    superannuation: {
      fundName: {
        type: String,
        trim: true,
      },
      memberNumber: {
        type: String,
        trim: true,
      },
      usi: {
        type: String,
        trim: true,
      },
    },
    taxFileNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          // Only validate if taxFileNumber is provided and not empty
          if (!v || v === "") return true;
          return /^\d{9}$/.test(v);
        },
        message: "Tax File Number must be exactly 9 digits",
      },
      select: false, // Don't return by default for security
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
    // If password is being changed and passwordHistory is already set (from API), use it
    // Otherwise, if it's a new user or passwordHistory wasn't set, initialize it
    if (!this.isNew && !this.passwordHistory) {
      // Get the old password hash before it's modified
      const user = await this.constructor.findById(this._id).select('+password +passwordHistory');
      if (user && user.password) {
        // Add old password to history, keeping only last 5
        const currentHistory = (user.passwordHistory || []) as string[];
        this.passwordHistory = [user.password, ...currentHistory].slice(0, 5);
      }
    }

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
    !!this.bankDetails && !!this.bankDetails.accountName && !!this.bankDetails.bsb && !!this.bankDetails.accountNumber, // Bank details
    !!this.superannuation && !!this.superannuation.fundName && !!this.superannuation.memberNumber, // Superannuation
    !!this.taxFileNumber && this.taxFileNumber.trim().length > 0, // Tax File Number
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

