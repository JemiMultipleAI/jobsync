import mongoose, { Schema, Document } from "mongoose";

export interface ITrainingProgram extends Document {
  title: string;
  description: string;
  content?: string;
  duration: string;
  level: string;
  format: string;
  category: string;
  published: boolean;
  featuredImage?: string;
  badgeName?: string;
  badgeIcon?: string;
  price?: number;
  free: boolean;
  enrolledUsers: mongoose.Types.ObjectId[];
  completedUsers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TrainingProgramSchema = new Schema<ITrainingProgram>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    content: {
      type: String,
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
    },
    level: {
      type: String,
      required: [true, "Level is required"],
      enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
    },
    format: {
      type: String,
      required: [true, "Format is required"],
      enum: ["Online", "In-Person", "Hybrid"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    published: {
      type: Boolean,
      default: false,
    },
    featuredImage: {
      type: String,
    },
    badgeName: {
      type: String,
    },
    badgeIcon: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    free: {
      type: Boolean,
      default: true,
    },
    enrolledUsers: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    completedUsers: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.TrainingProgram || mongoose.model<ITrainingProgram>("TrainingProgram", TrainingProgramSchema);
