"use client";

import { useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    role: string;
  };
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

interface UseStorySocketOptions {
  onNewComment?: (data: { storyId: string; comment: Comment }) => void;
}

export function useStorySocket(options: UseStorySocketOptions = {}) {
  const { onNewComment } = options;
  const { socket, isConnected } = useSocket();

  // Set up event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewComment = (data: { storyId: string; comment: Comment }) => {
      onNewComment?.(data);
    };

    socket.on("story:comment:new", handleNewComment);

    return () => {
      socket.off("story:comment:new", handleNewComment);
    };
  }, [socket, onNewComment]);

  // Comment on success story
  const commentOnStory = useCallback(
    async (storyId: string, content: string) => {
      if (!socket || !isConnected) {
        throw new Error("Socket not connected");
      }

      return new Promise<Comment>((resolve, reject) => {
        socket.emit(
          "story:comment",
          { storyId, content },
          (response: { comment?: Comment; error?: string }) => {
            if (response?.error) {
              reject(new Error(response.error));
            } else if (response?.comment) {
              resolve(response.comment);
            } else {
              reject(new Error("Failed to comment on story"));
            }
          }
        );
      });
    },
    [socket, isConnected]
  );

  // Like/unlike success story
  const likeStory = useCallback(
    async (storyId: string) => {
      if (!socket || !isConnected) {
        throw new Error("Socket not connected");
      }

      return new Promise<void>((resolve, reject) => {
        socket.emit("story:like", { storyId }, (response: { error?: string }) => {
          if (response?.error) {
            reject(new Error(response.error));
          } else {
            resolve();
          }
        });
      });
    },
    [socket, isConnected]
  );

  return {
    commentOnStory,
    likeStory,
    isConnected,
  };
}
