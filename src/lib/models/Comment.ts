import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId; // Reference to User
  blog?: mongoose.Types.ObjectId; // Reference to Blog (if commenting on blog)
  successStory?: mongoose.Types.ObjectId; // Reference to SuccessStory (if commenting on success story)
  parentComment?: mongoose.Types.ObjectId; // Reference to Comment (for nested replies)
  likes: mongoose.Types.ObjectId[]; // Array of user IDs who liked
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blog: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
    },
    successStory: {
      type: Schema.Types.ObjectId,
      ref: "SuccessStory",
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
CommentSchema.index({ blog: 1, createdAt: -1 });
CommentSchema.index({ successStory: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1 });

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
