"use client";

import { toast as sonnerToast } from "sonner";
import { useMemo } from "react";

export const useToast = () => {
  const toast = useMemo(
    () => ({
      success: (message: string) => {
        sonnerToast.success(message);
      },
      error: (message: string) => {
        sonnerToast.error(message);
      },
      info: (message: string) => {
        sonnerToast.info(message);
      },
      warning: (message: string) => {
        sonnerToast.warning(message);
      },
    }),
    []
  );

  return toast;
};

