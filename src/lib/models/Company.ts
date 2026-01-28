import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompany extends Document {
  name: string;
  description: string;
  industry: string;
  location: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  employees?: string; // e.g., "50-100", "100-500"
  established?: number;
  verified: boolean;
  rating?: number;
  openJobs: number;
  createdBy: mongoose.Types.ObjectId; // Reference to User (admin/employer)
  members: mongoose.Types.ObjectId[]; // Array of User IDs in this company
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Company description is required"],
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    employees: {
      type: String,
      trim: true,
    },
    established: {
      type: Number,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    openJobs: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  {
    timestamps: true,
  }
);

// Index for search
CompanySchema.index({ name: "text", description: "text", industry: "text" });
CompanySchema.index({ verified: 1, industry: 1 });

const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema);

export default Company;

