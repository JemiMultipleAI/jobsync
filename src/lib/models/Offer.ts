import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOffer extends Document {
  type: "interview" | "trial" | "job";
  employer: mongoose.Types.ObjectId; // Reference to User (employer)
  applicant: mongoose.Types.ObjectId; // Reference to User (applicant)
  application?: mongoose.Types.ObjectId; // Reference to Application (if applicable)
  job?: mongoose.Types.ObjectId; // Reference to Job (if applicable)
  message: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  expiresAt?: Date;
  scheduledDate?: Date; // For interviews
  location?: string; // For interviews
  trialDuration?: number; // Days for trial period
  salary?: {
    amount: number;
    currency: string;
    period: string;
  }; // For job offers
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    type: {
      type: String,
      enum: ["interview", "trial", "job"],
      required: true,
    },
    employer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    application: {
      type: Schema.Types.ObjectId,
      ref: "Application",
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "expired"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
    },
    scheduledDate: {
      type: Date,
    },
    location: {
      type: String,
    },
    trialDuration: {
      type: Number,
    },
    salary: {
      amount: Number,
      currency: String,
      period: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
OfferSchema.index({ applicant: 1, status: 1 });
OfferSchema.index({ employer: 1, status: 1 });
OfferSchema.index({ application: 1 });

const Offer: Model<IOffer> =
  mongoose.models.Offer ||
  mongoose.model<IOffer>("Offer", OfferSchema);

export default Offer;
