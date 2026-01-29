"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import {
  calculatePasswordStrength,
  getStrengthColor,
  getStrengthLabel,
  type PasswordStrength,
} from "@/lib/utils/passwordStrength";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<typeof calculatePasswordStrength>>({
    strength: "very-weak",
    score: 0,
    feedback: [],
  });
  const [passwordReused, setPasswordReused] = useState(false);

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password");

  // Calculate password strength in real-time
  useEffect(() => {
    if (password) {
      const strength = calculatePasswordStrength(password);
      setPasswordStrength(strength);

      // Check if password is reused
      if (token) {
        checkPasswordReuse(password);
      }
    } else {
      setPasswordStrength({
        strength: "very-weak",
        score: 0,
        feedback: [],
      });
    }
  }, [password, token]);

  const checkPasswordReuse = async (newPassword: string) => {
    try {
      const response = await fetch("/api/auth/check-password-reuse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: newPassword,
        }),
      });

      const result = await response.json();
      setPasswordReused(result.isReused || false);
    } catch (error) {
      console.error("Error checking password reuse:", error);
    }
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }

    if (passwordReused) {
      toast.error("You cannot reuse a previous password. Please choose a different one.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to reset password");
        setIsSubmitting(false);
        return;
      }

      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-white">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="border border-gray-200 shadow-xl rounded-2xl overflow-hidden bg-white max-w-md">
            <CardContent className="p-8 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link href="/auth/forgot-password">
                <Button className="w-full">
                  Request New Reset Link
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
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

              <Card className="border border-gray-200 shadow-xl rounded-2xl overflow-hidden bg-white">
                <CardHeader className="text-center pb-4 px-8 pt-8">
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    Reset Password
                  </CardTitle>
                  <p className="text-gray-600 mt-2">
                    Enter your new password below
                  </p>
                </CardHeader>

                <CardContent className="space-y-6 p-8">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-3">
                      <Label
                        htmlFor="password"
                        className="text-sm font-medium text-gray-700"
                      >
                        New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          className={`h-12 pl-10 pr-12 border-gray-200 rounded-xl transition-all duration-200 ${
                            errors.password
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
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
                      {passwordReused && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          You cannot reuse a previous password
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-gray-700"
                      >
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          className={`h-12 pl-10 pr-12 border-gray-200 rounded-xl transition-all duration-200 ${
                            errors.confirmPassword
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                              : "focus:border-[#B260E6] focus:ring-[#B260E6]"
                          }`}
                          {...register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <span>•</span>
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || passwordReused || passwordStrength.strength === "very-weak"}
                      className="w-full h-12 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Resetting...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </form>

                  <div className="text-center text-sm pt-4">
                    <Link
                      href="/auth/login"
                      className="text-[#B260E6] hover:text-[#A050D6] font-semibold transition-colors inline-flex items-center"
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Back to Sign In
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Password Strength Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border border-gray-200 shadow-xl rounded-2xl overflow-hidden bg-white sticky top-8">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Password Strength
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Strength Indicator */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {getStrengthLabel(passwordStrength.strength)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {passwordStrength.score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${getStrengthColor(
                          passwordStrength.strength
                        )}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Requirements:
                    </h4>
                    <ul className="space-y-2">
                      {[
                        { check: password.length >= 8, label: "At least 8 characters" },
                        { check: /[a-z]/.test(password || ""), label: "Lowercase letter" },
                        { check: /[A-Z]/.test(password || ""), label: "Uppercase letter" },
                        { check: /[0-9]/.test(password || ""), label: "Number" },
                        { check: /[^a-zA-Z0-9]/.test(password || ""), label: "Special character" },
                        { check: password.length >= 12, label: "At least 12 characters (recommended)" },
                      ].map((req, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          {req.check ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                          )}
                          <span className={req.check ? "text-gray-700" : "text-gray-400"}>
                            {req.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Additional Feedback */}
                  {passwordStrength.feedback.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Tips:
                      </h4>
                      <ul className="space-y-1">
                        {passwordStrength.feedback.map((tip, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-[#B260E6]">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

