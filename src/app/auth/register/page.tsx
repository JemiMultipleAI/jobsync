"use client";

import Link from "next/link";
import { useRouter  } from "next/navigation"
import { useForm  } from "react-hook-form"
import { zodResolver  } from "@hookform/resolvers/zod"
import * as z from "zod";
import { Eye  } from "lucide-react"
import { Shield  } from "lucide-react"
import{motion} from "framer-motion";
import { Button } from "@/components/ui/button";
import{User, Briefcase,CheckCircle} from "lucide-react"



import { Card,  CardContent,  CardHeader,  CardTitle  } from "@/components/ui/card"
import { Input  } from "@/components/ui/input"
import { Label  } from "@/components/ui/label"
import { Separator  } from "@/components/ui/separator"
import { 
  EyeOff, 
  ArrowRight, 
  Mail, 
  Lock, 
  Users, 
 } from "lucide-react"
import { useState  } from "react"

const registerSchema = z
  .object({
    role: z.enum(["user", "admin", "employer"], {
      error: "Please select a role",
    }),
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "user",
    },
  });

  const password = watch("password");
  const selectedRole = watch("role");

  const passwordStrength = {
    length: password ? password.length >= 8 : false,
    uppercase: password ? /[A-Z]/.test(password) : false,
    number: password ? /[0-9]/.test(password) : false,
    special: password
      ? /[!@#$%^&*()_+\-=\[\]{};&apos;:"\\|,.<>\/?]/.test(password)
      : false,
  };

  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || "Registration failed";
        // Use toast if available, otherwise alert
        if (typeof window !== "undefined" && (window as any).toast) {
          (window as any).toast.error(errorMessage);
        } else {
          alert(errorMessage);
        }
        setIsSubmitting(false);
        return;
      }

      // Redirect based on role
      if (result.user.role === "admin") {
        router.push("/admin");
      } else if (result.user.role === "employer") {
        router.push("/employer");
      } else {
        router.push("/user");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("An error occurred. Please try again.");
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
                Join JobSync 🚀
              </h1>
              <p className="text-xl opacity-90 leading-relaxed text-center">
                Create your account to start your job journey with
                Australia&apos;s verified workforce platform
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
                  <Shield className="h-6 w-6" />
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

              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Briefcase className="h-6 w-6" />
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
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">2,000+ Companies</h4>
                  <p className="text-sm opacity-80">
                    Trusted Australian employers
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 lg:p-12">
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
                  Join JobSync 🚀
                </CardTitle>
                <p className="text-gray-600 mt-2 text-center">
                  Create your account to start your job journey.
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-5 p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="space-y-3"
                >
                  <Label className="text-sm font-medium text-gray-700">
                    Register as
                  </Label>
                  <div className="grid grid-cols-3 gap-3 p-1 bg-gray-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setValue("role", "user")}
                      className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                        selectedRole === "user"
                          ? "bg-white shadow-md text-[#B260E6]"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">User</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("role", "employer")}
                      className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                        selectedRole === "employer"
                          ? "bg-white shadow-md text-[#B260E6]"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Briefcase className="h-5 w-5" />
                      <span className="font-medium">Employer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("role", "admin")}
                      className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                        selectedRole === "admin"
                          ? "bg-white shadow-md text-[#B260E6]"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Shield className="h-5 w-5" />
                      <span className="font-medium">Admin</span>
                    </button>
                  </div>
                  <input type="hidden" {...register("role")} />
                  {errors.role && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <span>•</span>
                      {errors.role.message}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                  className="space-y-3"
                >
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className={`h-12 pl-10 border-gray-200 rounded-xl transition-all duration-200 ${
                        errors.name
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "focus:border-[#B260E6] focus:ring-[#B260E6]"
                      }`}
                      {...register("name")}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <span>•</span>
                      {errors.name.message}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
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
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="space-y-3"
                >
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
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

                  {/* Password Strength Indicator */}
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="space-y-1.5 mt-2"
                    >
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4].map((index) => (
                          <div
                            key={index}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              index <= strengthScore
                                ? strengthScore >= 3
                                  ? "bg-green-500"
                                  : strengthScore >= 2
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <CheckCircle
                            className={`h-3 w-3 transition-colors ${
                              passwordStrength.length
                                ? "text-green-500"
                                : "text-gray-300"
                            }`}
                          />
                          <span
                            className={
                              passwordStrength.length
                                ? "text-green-600"
                                : "text-gray-500"
                            }
                          >
                            8+ characters
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle
                            className={`h-3 w-3 transition-colors ${
                              passwordStrength.uppercase
                                ? "text-green-500"
                                : "text-gray-300"
                            }`}
                          />
                          <span
                            className={
                              passwordStrength.uppercase
                                ? "text-green-600"
                                : "text-gray-500"
                            }
                          >
                            Uppercase
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle
                            className={`h-3 w-3 transition-colors ${
                              passwordStrength.number
                                ? "text-green-500"
                                : "text-gray-300"
                            }`}
                          />
                          <span
                            className={
                              passwordStrength.number
                                ? "text-green-600"
                                : "text-gray-500"
                            }
                          >
                            Number
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle
                            className={`h-3 w-3 transition-colors ${
                              passwordStrength.special
                                ? "text-green-500"
                                : "text-gray-300"
                            }`}
                          />
                          <span
                            className={
                              passwordStrength.special
                                ? "text-green-600"
                                : "text-gray-500"
                            }
                          >
                            Special char
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="space-y-3"
                >
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className={`h-12 pl-10 pr-12 border-gray-200 rounded-xl transition-all duration-200 ${
                        errors.confirmPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "focus:border-[#B260E6] focus:ring-[#B260E6]"
                      }`}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="relative"
              >
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-gray-500 font-medium">
                    Already have an account?
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                className="text-center"
              >
                <Link
                  href="/auth/login"
                  className="inline-flex items-center text-[#B260E6] hover:text-[#A050D6] font-semibold transition-colors"
                >
                  Login
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
