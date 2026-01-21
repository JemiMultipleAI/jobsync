"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // First, try to load user preferences from API if logged in
    const loadUserTheme = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const userPreferences = data.user?.preferences;
          
          if (userPreferences?.darkMode !== undefined) {
            const userTheme = userPreferences.darkMode ? "dark" : "light";
            setThemeState(userTheme);
            localStorage.setItem("theme", userTheme);
            document.documentElement.classList.toggle("dark", userTheme === "dark");
            setMounted(true);
            return;
          }
        }
      } catch (error) {
        // User not logged in or error fetching preferences, continue with fallback
      }
      
      // Fallback: Check localStorage for saved theme preference
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      if (savedTheme) {
        setThemeState(savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
      } else {
        // Check system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialTheme = prefersDark ? "dark" : "light";
        setThemeState(initialTheme);
        document.documentElement.classList.toggle("dark", initialTheme === "dark");
      }
      setMounted(true);
    };
    
    loadUserTheme();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    
    // Update user preferences in database if logged in
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          preferences: {
            darkMode: newTheme === "dark",
          },
        }),
      });
      // Silently fail if user is not logged in or update fails
    } catch (error) {
      // Silently fail
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  // Always provide the context, but don't apply theme until mounted to prevent hydration mismatch
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

