import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import connectDB from "@/lib/db/connect";
import { Conversation, Message } from "@/lib/models/Chat";
import Blog from "@/lib/models/Blog";
import Comment from "@/lib/models/Comment";
import User from "@/lib/models/User";
import { verifyTokenEdge } from "@/lib/auth/jwt-edge";
import mongoose from "mongoose";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

let io: SocketIOServer | null = null;

export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  console.log("[WebSocket] Initializing Socket.io server...");
  console.log("[WebSocket] App URL:", appUrl);
  console.log("[WebSocket] Socket path: /api/socket");
  
  io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: {
      origin: appUrl,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });
  
  console.log("[WebSocket] Socket.io server created");

  // Make io globally accessible for API routes
  if (typeof global !== "undefined") {
    (global as any).io = io;
  }

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
      
      console.log(`[WebSocket] Authentication attempt (socket ID: ${socket.id}, hasToken: ${!!token})`);
      
      if (!token) {
        console.error(`[WebSocket] Authentication failed: No token provided (socket ID: ${socket.id})`);
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = await verifyTokenEdge(token);
      if (!decoded || !decoded.userId) {
        console.error(`[WebSocket] Authentication failed: Invalid token (socket ID: ${socket.id})`);
        return next(new Error("Authentication error: Invalid token"));
      }

      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      console.log(`[WebSocket] Authentication successful: User ${decoded.userId} (role: ${decoded.role})`);
      next();
    } catch (error) {
      console.error(`[WebSocket] Authentication error:`, error);
      next(new Error("Authentication error: Token verification failed"));
    }
  });

  io.on("connection", async (socket: AuthenticatedSocket) => {
    console.log(`[WebSocket] User ${socket.userId} connected (socket ID: ${socket.id})`);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      console.log(`[WebSocket] User ${socket.userId} joined personal room: user:${socket.userId}`);
    }

    // Chat events
    setupChatHandlers(socket);
    
    // Blog events
    setupBlogHandlers(socket);
    
    // Success story events
    setupSuccessStoryHandlers(socket);

    socket.on("disconnect", (reason) => {
      console.log(`[WebSocket] User ${socket.userId} disconnected (reason: ${reason})`);
    });
  });

  return io;
}

// Notification helper function
export function sendNotification(userId: string, notification: {
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  data?: any;
}) {
  if (io) {
    io.to(`user:${userId}`).emit("notification", notification);
  }
}

function setupChatHandlers(socket: AuthenticatedSocket) {
  // Join conversation room
  socket.on("chat:join", async (conversationId: string) => {
    console.log(`[WebSocket] User ${socket.userId} attempting to join conversation:${conversationId}`);
    try {
      await connectDB();
      
      // Verify user is a participant
      const conversation = await Conversation.findOne({
        _id: conversationId,
        "participants.userId": socket.userId,
        isDeleted: { $ne: true },
      });

      if (conversation) {
        socket.join(`conversation:${conversationId}`);
        const roomSize = io?.sockets.adapter.rooms.get(`conversation:${conversationId}`)?.size || 0;
        console.log(`[WebSocket] User ${socket.userId} joined conversation:${conversationId} (room size: ${roomSize})`);
        
        // Mark conversation as read when user joins
        const participant = conversation.participants.find(
          (p: any) => p.userId.toString() === socket.userId
        );
        if (participant) {
          participant.lastReadAt = new Date();
          await conversation.save();
        }
        
        socket.emit("chat:joined", { conversationId });
      } else {
        console.error(`[WebSocket] Conversation not found: ${conversationId} for user ${socket.userId}`);
        socket.emit("chat:error", { message: "Conversation not found" });
      }
    } catch (error) {
      console.error("[WebSocket] Error joining conversation:", error);
      socket.emit("chat:error", { message: "Failed to join conversation" });
    }
  });

  // Leave conversation room
  socket.on("chat:leave", (conversationId: string) => {
    console.log(`[WebSocket] User ${socket.userId} leaving conversation:${conversationId}`);
    socket.leave(`conversation:${conversationId}`);
  });

  // Send message
  socket.on("chat:message", async (data: {
    conversationId: string;
    content?: string;
    attachments?: Array<{
      type: "image" | "file" | "document";
      url: string;
      filename: string;
      size?: number;
      mimeType?: string;
    }>;
  }, callback?: (response: { error?: string }) => void) => {
    console.log(`[WebSocket] Received chat:message from user ${socket.userId}`, {
      conversationId: data.conversationId,
      hasContent: !!data.content,
      attachmentsCount: data.attachments?.length || 0
    });
    try {
      await connectDB();

      if (!socket.userId) {
        console.error(`[WebSocket] Unauthorized: No userId on socket`);
        const errorResponse = { error: "Unauthorized" };
        socket.emit("chat:error", { message: "Unauthorized" });
        callback?.(errorResponse);
        return;
      }

      const { conversationId, content, attachments } = data;

      // Verify user is a participant
      const conversation = await Conversation.findOne({
        _id: conversationId,
        "participants.userId": socket.userId,
        isDeleted: { $ne: true },
      });

      if (!conversation) {
        console.error(`[WebSocket] Conversation not found: ${conversationId}`);
        const errorResponse = { error: "Conversation not found" };
        socket.emit("chat:error", { message: "Conversation not found" });
        callback?.(errorResponse);
        return;
      }

      // Validate message
      if (!content && (!attachments || attachments.length === 0)) {
        console.error(`[WebSocket] Invalid message: no content or attachments`);
        const errorResponse = { error: "Message content or attachments required" };
        socket.emit("chat:error", { message: "Message content or attachments required" });
        callback?.(errorResponse);
        return;
      }

      // Create message in MongoDB
      const message = await Message.create({
        conversationId,
        senderId: socket.userId,
        content: content?.trim() || undefined,
        attachments: attachments || [],
      });

      console.log(`[WebSocket] Created message ${message._id} in conversation ${conversationId}`);

      // Update conversation's last message
      conversation.lastMessage = message._id as mongoose.Types.ObjectId;
      conversation.lastMessageAt = new Date();
      await conversation.save();

      // Populate message with sender info
      const populatedMessage = await Message.findById(message._id)
        .populate("senderId", "name email profileImage role")
        .lean();

      // Add conversationId to message for client-side filtering
      const messageWithConversation = {
        ...populatedMessage,
        conversationId,
      };

      // Check which participants are currently viewing this conversation
      const conversationRoom = io?.sockets.adapter.rooms.get(`conversation:${conversationId}`);
      const roomSize = conversationRoom?.size || 0;
      console.log(`[WebSocket] Conversation room size: ${roomSize} for conversation:${conversationId}`);
      
      // Always send to conversation room (for users currently viewing)
      io?.to(`conversation:${conversationId}`).emit("chat:message:new", {
        message: messageWithConversation,
      });
      console.log(`[WebSocket] Emitted chat:message:new to conversation:${conversationId} room`);

      // Send to each participant's personal room for real-time updates
      // This ensures messages are received even if they haven't selected the conversation
      const participantIds: string[] = [];
      conversation.participants.forEach((participant: any) => {
        const participantId = participant.userId.toString();
        participantIds.push(participantId);
        
        // Always send to participant's personal room
        io?.to(`user:${participantId}`).emit("chat:message:new", {
          message: messageWithConversation,
        });
        console.log(`[WebSocket] Emitted chat:message:new to user:${participantId} personal room`);

        // For participants other than sender, also send notification if not viewing
        if (participantId !== socket.userId) {
          // Check if participant is currently viewing this conversation
          let isInConversationRoom = false;
          if (conversationRoom) {
            // Find socket for this participant
            for (const [socketId, socketInstance] of io!.sockets.sockets.entries()) {
              if ((socketInstance as AuthenticatedSocket).userId === participantId && conversationRoom.has(socketId)) {
                isInConversationRoom = true;
                break;
              }
            }
          }

          // Send notification to user's personal room if not viewing
          if (!isInConversationRoom) {
            io?.to(`user:${participantId}`).emit("chat:notification", {
              conversationId,
              message: messageWithConversation,
              isUnread: true,
            });
            
            // Send general notification
            io?.to(`user:${participantId}`).emit("notification", {
              title: "New Message",
              message: `${populatedMessage.senderId.name}: ${populatedMessage.content || "Sent an attachment"}`,
              type: "info",
              data: {
                conversationId,
                messageId: message._id,
              },
            });
            console.log(`[WebSocket] Sent notifications to user:${participantId} (not viewing conversation)`);
          } else {
            console.log(`[WebSocket] User ${participantId} is viewing conversation, skipped notification`);
          }
        }
      });
      
      console.log(`[WebSocket] Message broadcast complete. Participants: ${participantIds.join(", ")}`);
      
      // Acknowledge the message was sent successfully
      callback?.({});
    } catch (error) {
      console.error("[WebSocket] Error sending message:", error);
      const errorResponse = { error: "Failed to send message" };
      socket.emit("chat:error", { message: "Failed to send message" });
      callback?.(errorResponse);
    }
  });

  // Typing indicator
  socket.on("chat:typing", (data: { conversationId: string; isTyping: boolean }) => {
    console.log(`[WebSocket] User ${socket.userId} typing in conversation:${data.conversationId} (${data.isTyping})`);
    socket.to(`conversation:${data.conversationId}`).emit("chat:typing", {
      userId: socket.userId,
      conversationId: data.conversationId,
      isTyping: data.isTyping,
    });
  });
}

function setupBlogHandlers(socket: AuthenticatedSocket) {
  // Create blog post
  socket.on("blog:create", async (data: {
    title: string;
    content: string;
    imageUrl?: string;
    tags?: string[];
  }) => {
    try {
      await connectDB();

      if (!socket.userId) {
        socket.emit("blog:error", { message: "Unauthorized" });
        return;
      }

      const user = await User.findById(socket.userId);
      if (!user || (user.role !== "user" && user.role !== "employer")) {
        socket.emit("blog:error", { message: "Unauthorized. Only users and employers can create blogs." });
        return;
      }

      // Get user's company if they're an employer
      let companyId = null;
      if (user.role === "employer" && user.company) {
        companyId = user.company;
      }

      const blog = await Blog.create({
        title: data.title.trim(),
        content: data.content.trim(),
        author: socket.userId,
        authorType: user.role === "employer" ? "employer" : "user",
        company: companyId,
        imageUrl: data.imageUrl || undefined,
        tags: data.tags || [],
        published: true,
      });

      const populatedBlog = await Blog.findById(blog._id)
        .populate("author", "name email profileImage role")
        .populate("company", "name logo")
        .lean();

      // Broadcast new blog to all connected clients
      io?.emit("blog:new", { blog: populatedBlog });

      socket.emit("blog:created", { blog: populatedBlog });
    } catch (error) {
      console.error("Error creating blog:", error);
      socket.emit("blog:error", { message: "Failed to create blog" });
    }
  });

  // Like/unlike blog
  socket.on("blog:like", async (data: { blogId: string }) => {
    try {
      await connectDB();

      if (!socket.userId) {
        socket.emit("blog:error", { message: "Unauthorized" });
        return;
      }

      const blog = await Blog.findById(data.blogId);
      if (!blog) {
        socket.emit("blog:error", { message: "Blog not found" });
        return;
      }

      const userId = new mongoose.Types.ObjectId(socket.userId);
      const isLiked = blog.likes?.some((id: any) => id.toString() === socket.userId);

      if (isLiked) {
        blog.likes = blog.likes?.filter((id: any) => id.toString() !== socket.userId) || [];
      } else {
        if (!blog.likes) blog.likes = [];
        blog.likes.push(userId);
      }

      await blog.save();

      const updatedBlog = await Blog.findById(data.blogId)
        .populate("author", "name email profileImage role")
        .populate("company", "name logo")
        .lean();

      // Broadcast like update
      io?.emit("blog:like:update", {
        blogId: data.blogId,
        blog: updatedBlog,
      });

      socket.emit("blog:liked", { blog: updatedBlog });
    } catch (error) {
      console.error("Error liking blog:", error);
      socket.emit("blog:error", { message: "Failed to like blog" });
    }
  });

  // Comment on blog
  socket.on("blog:comment", async (data: {
    blogId: string;
    content: string;
  }) => {
    try {
      await connectDB();

      if (!socket.userId) {
        socket.emit("blog:error", { message: "Unauthorized" });
        return;
      }

      const blog = await Blog.findById(data.blogId);
      if (!blog) {
        socket.emit("blog:error", { message: "Blog not found" });
        return;
      }

      const comment = await Comment.create({
        content: data.content.trim(),
        author: socket.userId,
        blog: data.blogId,
      });

      const populatedComment = await Comment.findById(comment._id)
        .populate("author", "name email profileImage role")
        .lean();

      // Broadcast new comment
      io?.emit("blog:comment:new", {
        blogId: data.blogId,
        comment: populatedComment,
      });

      socket.emit("blog:commented", { comment: populatedComment });
    } catch (error) {
      console.error("Error commenting on blog:", error);
      socket.emit("blog:error", { message: "Failed to comment on blog" });
    }
  });
}

function setupSuccessStoryHandlers(socket: AuthenticatedSocket) {
  // Comment on success story
  socket.on("story:comment", async (data: {
    storyId: string;
    content: string;
  }) => {
    try {
      await connectDB();

      if (!socket.userId) {
        socket.emit("story:error", { message: "Unauthorized" });
        return;
      }

      // Note: Success stories might be stored differently - adjust based on your model
      const comment = await Comment.create({
        content: data.content.trim(),
        author: socket.userId,
        successStory: data.storyId,
      });

      const populatedComment = await Comment.findById(comment._id)
        .populate("author", "name email profileImage role")
        .lean();

      // Broadcast new comment
      io?.emit("story:comment:new", {
        storyId: data.storyId,
        comment: populatedComment,
      });

      socket.emit("story:commented", { comment: populatedComment });
    } catch (error) {
      console.error("Error commenting on story:", error);
      socket.emit("story:error", { message: "Failed to comment on story" });
    }
  });

  // Like/unlike success story
  socket.on("story:like", async (data: { storyId: string }) => {
    try {
      await connectDB();

      if (!socket.userId) {
        socket.emit("story:error", { message: "Unauthorized" });
        return;
      }

      // Note: Adjust based on your success story model
      // This is a placeholder - you'll need to implement based on your actual model
      socket.emit("story:error", { message: "Success story like not yet implemented" });
    } catch (error) {
      console.error("Error liking story:", error);
      socket.emit("story:error", { message: "Failed to like story" });
    }
  });
}

export function getIO(): SocketIOServer | null {
  return io;
}
