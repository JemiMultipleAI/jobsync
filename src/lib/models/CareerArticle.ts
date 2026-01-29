import mongoose, { Schema, Document } from "mongoose";

export interface ICareerArticle extends Document {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  published: boolean;
  featuredImage?: string;
  tags: string[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const CareerArticleSchema = new Schema<ICareerArticle>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    excerpt: {
      type: String,
      required: [true, "Excerpt is required"],
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Resume Tips", "Interview Tips", "Networking", "Career Growth", "Industry Insights", "Other"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      default: "JobSync Team",
    },
    published: {
      type: Boolean,
      default: false,
    },
    featuredImage: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CareerArticle || mongoose.model<ICareerArticle>("CareerArticle", CareerArticleSchema);
