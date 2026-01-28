import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJob extends Document {
  title: string;
  company: mongoose.Types.ObjectId; // Reference to Company
  description: string;
  requirements: string[];
  location: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string; // "year", "month", "hour"
  };
  type: "full-time" | "part-time" | "contract" | "temporary";
  status: "active" | "closed" | "draft";
  industry: string;
  experienceLevel?: "entry" | "mid" | "senior" | "executive";
  postedBy: mongoose.Types.ObjectId; // Reference to User (admin/employer)
  image?: string;
  applicationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    requirements: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: "AUD",
      },
      period: {
        type: String,
        enum: ["year", "month", "hour"],
        default: "year",
      },
    },
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "temporary"],
      required: [true, "Job type is required"],
    },
    status: {
      type: String,
      enum: ["active", "closed", "draft"],
      default: "active",
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      trim: true,
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "executive"],
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String,
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
JobSchema.index({ title: "text", description: "text", location: "text" });
JobSchema.index({ company: 1, status: 1 });
JobSchema.index({ createdAt: -1 });

const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);

export default Job;

