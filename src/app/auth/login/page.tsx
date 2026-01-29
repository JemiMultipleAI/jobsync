"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm  } from "react-hook-form"
import { zodResolver  } from "@hookform/resolvers/zod"
import * as z from "zod";
import React from "react"
import{motion} from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { useTheme } from "@/lib/contexts/ThemeContext";

import { Card,  CardContent,  CardHeader,  CardTitle  } from "@/components/ui/card"
import { Input  } from "@/components/ui/input"
import { Label  } from "@/components/ui/label"
import { 
  Eye,
  EyeOff, 
  LogIn, 
  ArrowRight, 
  Mail, 
  Lock, 
} from "lucide-react"
import { useState  } from "react"
import { Checkbox } from "@/components/ui/checkbox"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      // Use fetch directly to ensure cookies are handled properly
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          rememberMe: rememberMe,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || "Login failed";
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }

      toast.success("Login successful!");

      // Fetch user preferences to apply theme
      try {
        const profileResponse = await fetch("/api/auth/profile", {
          credentials: "include",
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const userPreferences = profileData.user?.preferences;
          
          // Apply user's theme preference if available
          if (userPreferences?.darkMode !== undefined) {
            const userTheme = userPreferences.darkMode ? "dark" : "light";
            setTheme(userTheme);
            // Also update localStorage to persist
            localStorage.setItem("theme", userTheme);
          }
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
        // Continue with login even if preferences fetch fails
      }

      // The cookie is set by the server response
      // Wait for it to be fully processed, then redirect
      // Check for redirect parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get("redirect");
      
      let redirectPath = "/user";
      if (result.user.role === "admin") {
        redirectPath = "/admin";
      } else if (result.user.role === "employer") {
        redirectPath = "/employer";
      }
      
      // If there's a redirect parameter, use it (for all roles)
      if (redirectParam) {
        redirectPath = redirectParam;
      }
      
      // Wait longer to ensure cookie is fully persisted and theme is applied
      // Then redirect using window.location which ensures cookie is sent
      setTimeout(() => {
        // Force a full navigation to ensure cookie is included in request
        window.location.href = redirectPath;
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again.";
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-gray-900">
      {/* Form Section - Centered */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Logo */}
          <div className="text-center mb-8 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center space-x-3 justify-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white font-bold text-xl shadow-lg">
                J
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] bg-clip-text text-transparent">
                JobSync
              </span>
            </Link>
          </div>

          <Card className="border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-gray-800 mx-auto w-full max-w-md">
            <CardHeader className="text-center pb-4 px-8 pt-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
                  Sign In
                </CardTitle>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6 p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="space-y-3"
                >
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className={`h-12 pl-10 border-gray-200 dark:border-gray-600 rounded-xl transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white dark:bg-gray-700 ${
                        errors.email
                          ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "focus:border-[#B260E6] focus:ring-[#B260E6]"
                      }`}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <span>•</span>
                      {errors.email.message}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Password
                    </Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-[#ED84A5] hover:text-[#DD74A5] font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={`h-12 pl-10 pr-12 border-gray-200 dark:border-gray-600 rounded-xl transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white dark:bg-gray-700 ${
                        errors.password
                          ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "focus:border-[#B260E6] focus:ring-[#B260E6]"
                      }`}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <span>•</span>
                      {errors.password.message}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 }}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Stay signed in
                  </Label>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-5 w-5" />
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="text-center text-sm pt-4"
              >
                <span className="text-gray-600 dark:text-gray-300">
                  Don&apos;t have an account yet?{" "}
                </span>
                <Link
                  href="/auth/register"
                  className="text-[#B260E6] hover:text-[#A050D6] font-semibold transition-colors inline-flex items-center"
                >
                  Sign up
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
