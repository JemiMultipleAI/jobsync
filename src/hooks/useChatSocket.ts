"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useSocket } from "./useSocket";
import { Socket } from "socket.io-client";

interface ChatMessage {
  _id: string;
  conversationId?: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    role: string;
  };
  content?: string;
  attachments?: Array<{
    type: "image" | "file" | "document";
    url: string;
    filename: string;
    size?: number;
    mimeType?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  isUnread?: boolean;
}

interface UseChatSocketOptions {
  conversationId?: string;
  onNewMessage?: (message: ChatMessage) => void;
  onTyping?: (data: { userId: string; isTyping: boolean }) => void;
  onNotification?: (data: { conversationId: string; message: ChatMessage }) => void;
}

export function useChatSocket(options: UseChatSocketOptions = {}) {
  const { conversationId, onNewMessage, onTyping, onNotification } = options;
  const { socket, isConnected } = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Join/leave conversation room
  useEffect(() => {
    if (!socket || !conversationId || !isConnected) {
      console.log("[Client] Cannot join conversation:", {
        hasSocket: !!socket,
        conversationId,
        isConnected
      });
      return;
    }

    console.log(`[Client] Joining conversation: ${conversationId}`);
    socket.emit("chat:join", conversationId);

    return () => {
      console.log(`[Client] Leaving conversation: ${conversationId}`);
      socket.emit("chat:leave", conversationId);
    };
  }, [socket, conversationId, isConnected]);

  // Set up message listeners
  useEffect(() => {
    if (!socket) {
      console.log("[Client] No socket available for message listeners");
      return;
    }

    console.log("[Client] Setting up chat message listeners");

    const handleNewMessage = (data: { message: ChatMessage }) => {
      console.log("[Client] Received chat:message:new", {
        messageId: data.message._id,
        conversationId: data.message.conversationId,
        senderId: data.message.senderId._id,
        hasContent: !!data.message.content,
        attachmentsCount: data.message.attachments?.length || 0
      });
      // Always call onNewMessage - let the component decide if it's for the current conversation
      onNewMessage?.(data.message);
    };
    
    const handleRead = (data: { conversationId: string; userId: string; readAt: Date }) => {
      // Handle read receipts - could be used to show "seen" indicators
      if (data.conversationId === conversationId) {
        // Update UI to show read status
      }
    };

    const handleTyping = (data: { userId: string; conversationId: string; isTyping: boolean }) => {
      if (data.conversationId === conversationId) {
        onTyping?.({ userId: data.userId, isTyping: data.isTyping });
      }
    };

    const handleNotification = (data: { conversationId: string; message: ChatMessage }) => {
      console.log("[Client] Received chat:notification", {
        conversationId: data.conversationId,
        messageId: data.message._id
      });
      onNotification?.(data);
    };

    socket.on("chat:message:new", handleNewMessage);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:notification", handleNotification);
    socket.on("chat:read", handleRead);

    return () => {
      socket.off("chat:message:new", handleNewMessage);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:notification", handleNotification);
      socket.off("chat:read", handleRead);
    };
  }, [socket, conversationId, onNewMessage, onTyping, onNotification]);

  // Send message
  const sendMessage = useCallback(
    async (
      content?: string,
      attachments?: Array<{
        type: "image" | "file" | "document";
        url: string;
        filename: string;
        size?: number;
        mimeType?: string;
      }>
    ) => {
      if (!socket || !conversationId || !isConnected) {
        console.error("[Client] Cannot send message:", {
          hasSocket: !!socket,
          conversationId,
          isConnected
        });
        throw new Error("Socket not connected");
      }

      console.log("[Client] Sending message via WebSocket", {
        conversationId,
        hasContent: !!content,
        attachmentsCount: attachments?.length || 0
      });

      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error("[Client] Message send timeout - no response from server");
          reject(new Error("Message send timeout"));
        }, 10000); // 10 second timeout

        socket.emit(
          "chat:message",
          {
            conversationId,
            content,
            attachments,
          },
          (response: { error?: string }) => {
            clearTimeout(timeout);
            if (response?.error) {
              console.error("[Client] Message send error:", response.error);
              reject(new Error(response.error));
            } else {
              console.log("[Client] Message sent successfully");
              resolve();
            }
          }
        );
      });
    },
    [socket, conversationId, isConnected]
  );

  // Typing indicator
  const setTyping = useCallback(
    (typing: boolean) => {
      if (!socket || !conversationId || !isConnected) {
        return;
      }

      setIsTyping(typing);
      socket.emit("chat:typing", { conversationId, isTyping: typing });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Auto-stop typing after 3 seconds
      if (typing) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          socket.emit("chat:typing", { conversationId, isTyping: false });
        }, 3000);
      }
    },
    [socket, conversationId, isConnected]
  );

  return {
    sendMessage,
    setTyping,
    isTyping,
    isConnected,
  };
}
