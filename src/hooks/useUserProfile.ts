"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "user" | "employer" | "admin";
  profileImage?: string;
}

interface UseUserProfileReturn {
  user: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage user profile
 */
export function useUserProfile(): UseUserProfileReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.get<{ user: UserProfile }>("/api/auth/profile");
      setUser(data.user);
    } catch (err) {
      // Silently fail - user might not be logged in or token expired
      setError(err instanceof Error ? err : new Error("Failed to fetch user profile"));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUserProfile,
  };
}
