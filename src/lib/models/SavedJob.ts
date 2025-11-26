import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISavedJob extends Document {
  user: mongoose.Types.ObjectId; // Reference to User
  job: mongoose.Types.ObjectId; // Reference to Job
  savedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SavedJobSchema = new Schema<ISavedJob>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job is required"],
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate saved jobs
SavedJobSchema.index({ user: 1, job: 1 }, { unique: true });
SavedJobSchema.index({ user: 1, savedAt: -1 });

const SavedJob: Model<ISavedJob> =
  mongoose.models.SavedJob ||
  mongoose.model<ISavedJob>("SavedJob", SavedJobSchema);

export default SavedJob;

