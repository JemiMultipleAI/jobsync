"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

interface UseSocketOptions {
  autoConnect?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true } = options;
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null); // Store in state to trigger re-renders
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!autoConnect || !user) {
      console.log("[Client] Socket auto-connect disabled or no user:", { autoConnect, hasUser: !!user });
      setSocket(null);
      socketRef.current = null;
      return;
    }

    let mounted = true;

    // Get token from API endpoint (since httpOnly cookies can't be read by JS)
    const getToken = async () => {
      try {
        const response = await fetch("/api/auth/socket-token", {
          credentials: "include", // Include cookies
        });
        
        if (!response.ok) {
          console.error("[Client] Failed to get socket token:", response.status);
          return null;
        }
        
        const data = await response.json();
        return data.token || null;
      } catch (error) {
        console.error("[Client] Error fetching socket token:", error);
        return null;
      }
    };

    const initializeSocket = async () => {
      const token = await getToken();
      
      if (!token || !mounted) {
        if (!mounted) return;
        console.error("[Client] No authentication token found");
        setError("No authentication token found");
        setSocket(null);
        socketRef.current = null;
        return;
      }

      console.log("[Client] Initializing socket connection...");
      // Initialize socket connection
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
      const newSocket = io(appUrl, {
        path: "/api/socket",
        auth: {
          token,
        },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      if (!mounted) {
        newSocket.disconnect();
        return;
      }

      socketRef.current = newSocket;
      setSocket(newSocket); // Update state to trigger re-render

      newSocket.on("connect", () => {
        if (!mounted) return;
        setIsConnected(true);
        setError(null);
        console.log("[Client] Socket connected", {
          socketId: newSocket.id,
          userId: user?._id,
          url: appUrl,
          path: "/api/socket"
        });
      });

      newSocket.on("disconnect", (reason) => {
        if (!mounted) return;
        setIsConnected(false);
        console.log("[Client] Socket disconnected", {
          reason,
          socketId: newSocket.id
        });
      });

      newSocket.on("connect_error", (err: any) => {
        if (!mounted) return;
        setError(err.message || "Connection error");
        console.error("[Client] Socket connection error:", {
          message: err.message,
          type: err.type,
          description: err.description,
          url: appUrl,
          path: "/api/socket",
          hasToken: !!token
        });
      });
    };

    initializeSocket();

    return () => {
      mounted = false;
      if (socketRef.current) {
        console.log("[Client] Cleaning up socket connection");
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [autoConnect, user]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  return {
    socket, // Return from state instead of ref
    isConnected,
    error,
    disconnect,
  };
}
