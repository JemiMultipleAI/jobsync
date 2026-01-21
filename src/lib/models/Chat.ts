import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatParticipant extends Document {
  userId: mongoose.Types.ObjectId;
  role?: "admin" | "moderator" | "member"; // For group chats
  joinedAt: Date;
  lastReadAt?: Date;
  isArchived?: boolean;
  isFavorited?: boolean;
  isBanner?: boolean;
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content?: string;
  attachments?: Array<{
    type: "image" | "file" | "document";
    url: string;
    filename: string;
    size?: number;
    mimeType?: string;
  }>;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  type: "direct" | "group";
  participants: IChatParticipant[];
  name?: string; // For group chats
  description?: string; // For group chats
  avatar?: string; // For group chats
  createdBy: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChatParticipantSchema = new Schema<IChatParticipant>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "moderator", "member"],
    default: "member",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  lastReadAt: {
    type: Date,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  isFavorited: {
    type: Boolean,
    default: false,
  },
  isBanner: {
    type: Boolean,
    default: false,
  },
});

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        type: {
          type: String,
          enum: ["image", "file", "document"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        filename: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
        },
        mimeType: {
          type: String,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const ConversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    participants: [ChatParticipantSchema],
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ConversationSchema.index({ "participants.userId": 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ type: 1 });
MessageSchema.index({ conversationId: 1, createdAt: -1 });

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export const Message: Model<IMessage> =
  mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
