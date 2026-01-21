"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to send reset email");
        setIsSubmitting(false);
        return;
      }

      toast.success("Password reset email sent! Please check your inbox.");
      setEmailSent(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
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

          <Card className="border border-gray-200 shadow-xl rounded-2xl overflow-hidden bg-white mx-auto w-full max-w-md">
            <CardHeader className="text-center pb-4 px-8 pt-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2 text-center">
                  Forgot Password?
                </CardTitle>
                <p className="text-gray-600 mt-2 text-center">
                  {emailSent
                    ? "We've sent you a password reset link. Please check your email."
                    : "Enter your email address and we'll send you a link to reset your password."}
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6 p-8">
              {emailSent ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-gray-600">
                    If an account exists with that email, you'll receive a password reset link shortly.
                  </p>
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="space-y-3"
                  >
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className={`h-12 pl-10 border-gray-200 rounded-xl transition-all duration-200 ${
                          errors.email
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
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
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Reset Link
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="text-center text-sm pt-4"
              >
                <Link
                  href="/auth/login"
                  className="text-[#B260E6] hover:text-[#A050D6] font-semibold transition-colors inline-flex items-center"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Sign In
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

