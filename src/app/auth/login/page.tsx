"use client";

import Link from "next/link";
// import { useRouter  } from "next/navigation" // Removed unused import
import { useForm  } from "react-hook-form"
import { zodResolver  } from "@hookform/resolvers/zod"
import * as z from "zod";
import { Briefcase } from "lucide-react"
import { Award  } from "lucide-react"
import React from "react"
import{motion} from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";

import { Card,  CardContent,  CardHeader,  CardTitle  } from "@/components/ui/card"
import { Input  } from "@/components/ui/input"
import { Label  } from "@/components/ui/label"
import { Separator  } from "@/components/ui/separator"
import { 
  Eye,
  EyeOff, 
  LogIn, 
  ArrowRight, 
  Mail, 
  Lock, 
  Users, 
} from "lucide-react"
import { useState  } from "react"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  // const router = useRouter(); // Removed unused variable
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // The cookie is set by the server response
      // Wait for it to be fully processed, then redirect
      let redirectPath = "/user";
      if (result.user.role === "admin") {
        redirectPath = "/admin";
      } else if (result.user.role === "employer") {
        redirectPath = "/employer";
      }
      
      // Wait longer to ensure cookie is fully persisted
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
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Side - Gradient Background with Content */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#B260E6] via-[#D670C5] to-[#ED84A5] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white"
        >
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex justify-center mb-6">
                <Link
                  href="/"
                  className="inline-flex items-center space-x-3 justify-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white font-bold text-2xl shadow-xl">
                    J
                  </div>
                  <span className="font-bold text-3xl bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                    JobSync
                  </span>
                </Link>
              </div>
              <h1 className="text-4xl font-bold mb-4 leading-tight text-center">
                Welcome back 👋
              </h1>
              <p className="text-xl opacity-90 leading-relaxed text-center">
                Sign in to access your Australian career opportunities and
                verified credentials
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">50,000+ Jobs</h4>
                  <p className="text-sm opacity-80">
                    Active opportunities across Australia
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">2,000+ Companies</h4>
                  <p className="text-sm opacity-80">
                    Trusted Australian employers
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">
                    Verified Credentials
                  </h4>
                  <p className="text-sm opacity-80">
                    Portable qualifications system
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8 flex justify-center">
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

          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-card mx-auto">
            <CardHeader className="text-center pb-4 px-8 pt-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2 text-center">
                  Welcome back 👋
                </CardTitle>
                <p className="text-gray-600 mt-2 text-center">
                  Sign in to access your dashboard.
                </p>
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
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password
                    </Label>
                    <Link
                      href="#"
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-gray-300 text-[#B260E6] focus:ring-[#B260E6] transition-colors"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me for 30 days
                  </Label>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
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
                transition={{ duration: 0.4, delay: 0.7 }}
                className="relative"
              >
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-gray-500 font-medium">
                    Or continue with
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="grid grid-cols-1 gap-3"
              >
                <Button
                  variant="outline"
                  type="button"
                  className="h-12 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                className="text-center text-sm pt-2"
              >
                <span className="text-gray-600">
                  Don&apos;t have an account?{" "}
                </span>
                <Link
                  href="/auth/register"
                  className="text-[#B260E6] hover:text-[#A050D6] font-semibold transition-colors inline-flex items-center"
                >
                  Register
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
