"use client";

import { useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    role: string;
  };
  imageUrl?: string;
  tags: string[];
  likes: string[];
  views: number;
  createdAt: string;
  updatedAt: string;
}

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

interface UseBlogSocketOptions {
  onNewBlog?: (blog: Blog) => void;
  onBlogLikeUpdate?: (data: { blogId: string; blog: Blog }) => void;
  onNewComment?: (data: { blogId: string; comment: Comment }) => void;
}

export function useBlogSocket(options: UseBlogSocketOptions = {}) {
  const { onNewBlog, onBlogLikeUpdate, onNewComment } = options;
  const { socket, isConnected } = useSocket();

  // Set up event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewBlog = (data: { blog: Blog }) => {
      onNewBlog?.(data.blog);
    };

    const handleBlogLikeUpdate = (data: { blogId: string; blog: Blog }) => {
      onBlogLikeUpdate?.(data);
    };

    const handleNewComment = (data: { blogId: string; comment: Comment }) => {
      onNewComment?.(data);
    };

    socket.on("blog:new", handleNewBlog);
    socket.on("blog:like:update", handleBlogLikeUpdate);
    socket.on("blog:comment:new", handleNewComment);

    return () => {
      socket.off("blog:new", handleNewBlog);
      socket.off("blog:like:update", handleBlogLikeUpdate);
      socket.off("blog:comment:new", handleNewComment);
    };
  }, [socket, onNewBlog, onBlogLikeUpdate, onNewComment]);

  // Create blog
  const createBlog = useCallback(
    async (data: {
      title: string;
      content: string;
      imageUrl?: string;
      tags?: string[];
    }) => {
      if (!socket || !isConnected) {
        throw new Error("Socket not connected");
      }

      return new Promise<Blog>((resolve, reject) => {
        socket.emit("blog:create", data, (response: { blog?: Blog; error?: string }) => {
          if (response?.error) {
            reject(new Error(response.error));
          } else if (response?.blog) {
            resolve(response.blog);
          } else {
            reject(new Error("Failed to create blog"));
          }
        });
      });
    },
    [socket, isConnected]
  );

  // Like/unlike blog
  const likeBlog = useCallback(
    async (blogId: string) => {
      if (!socket || !isConnected) {
        throw new Error("Socket not connected");
      }

      return new Promise<Blog>((resolve, reject) => {
        socket.emit("blog:like", { blogId }, (response: { blog?: Blog; error?: string }) => {
          if (response?.error) {
            reject(new Error(response.error));
          } else if (response?.blog) {
            resolve(response.blog);
          } else {
            reject(new Error("Failed to like blog"));
          }
        });
      });
    },
    [socket, isConnected]
  );

  // Comment on blog
  const commentOnBlog = useCallback(
    async (blogId: string, content: string) => {
      if (!socket || !isConnected) {
        throw new Error("Socket not connected");
      }

      return new Promise<Comment>((resolve, reject) => {
        socket.emit(
          "blog:comment",
          { blogId, content },
          (response: { comment?: Comment; error?: string }) => {
            if (response?.error) {
              reject(new Error(response.error));
            } else if (response?.comment) {
              resolve(response.comment);
            } else {
              reject(new Error("Failed to comment on blog"));
            }
          }
        );
      });
    },
    [socket, isConnected]
  );

  return {
    createBlog,
    likeBlog,
    commentOnBlog,
    isConnected,
  };
}
