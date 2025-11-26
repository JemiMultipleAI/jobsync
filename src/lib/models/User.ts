import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
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
      enum: ["user", "admin"],
      default: "user",
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
      this.profileCompletion = this.calculateProfileCompletion();
    }
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    // Update profile completion
    if (!this.isNew) {
      this.profileCompletion = this.calculateProfileCompletion();
    }
    next();
  } catch (error: any) {
    next(error);
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
  const fields = [
    this.name,
    this.email,
    this.bio,
    this.phone,
    this.location,
    this.skills?.length > 0,
    this.profileImage,
    this.resume,
  ];

  const completedFields = fields.filter(Boolean).length;
  const completion = Math.round((completedFields / fields.length) * 100);

  return completion;
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

