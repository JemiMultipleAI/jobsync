"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { useUserProfile } from "./useUserProfile";

interface UseAuthReturn {
  user: ReturnType<typeof useUserProfile>["user"];
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

/**
 * Hook for authentication state and actions
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const toast = useToast();
  const { user, isLoading, refetch } = useUserProfile();

  const logout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to logout";
      toast.error(errorMessage);
      // Still redirect even if logout fails
      router.push("/auth/login");
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
