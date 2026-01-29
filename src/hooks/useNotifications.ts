"use client";

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./useSocket";

export interface Notification {
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  data?: any;
  timestamp: Date;
  id: string;
}

export function useNotifications() {
  // Always call useSocket to maintain hook order
  const socketResult = useSocket();
  const socket = socketResult?.socket || null;
  const isConnected = socketResult?.isConnected || false;
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: Omit<Notification, "timestamp" | "id">) => {
      const newNotification: Notification = {
        ...notification,
        timestamp: new Date(),
        id: `${Date.now()}-${Math.random()}`,
      };
      
      setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket]);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
    isConnected,
  };
}
