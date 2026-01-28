import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId; // Reference to Job
  applicant: mongoose.Types.ObjectId; // Reference to User
  status: "pending" | "under-review" | "shortlisted" | "rejected" | "accepted";
  coverLetter?: string;
  resume?: string; // Path to resume file
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId; // Reference to User (admin/employer)
  notes?: string; // Internal notes
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job is required"],
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant is required"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "under-review",
        "shortlisted",
        "rejected",
        "accepted",
      ],
      default: "pending",
    },
    coverLetter: {
      type: String,
    },
    resume: {
      type: String,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
ApplicationSchema.index({ applicant: 1, status: 1 });
ApplicationSchema.index({ job: 1, status: 1 });

const Application: Model<IApplication> =
  mongoose.models.Application ||
  mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;

