"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { Eye, EyeOff, User, Building, ArrowRight, CheckCircle, MapPin, Star, AlertCircle } from "lucide-react"
import { useToast } from "@/lib/hooks/useToast"
import { useRouter } from "next/navigation"

interface FormErrors {
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "job_seeker", // default
  })
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'firstname':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        break;
      case 'lastname':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        break;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        break;
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== form.password) return 'Passwords do not match';
        break;
    }
    return undefined;
  };

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, form[field as keyof typeof form]);
    if (error) {
      setErrors({ ...errors, [field]: error });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: FormErrors = {};
    Object.keys(form).forEach((key) => {
      if (key !== 'role') {
        const error = validateField(key, form[key as keyof typeof form]);
        if (error) {
          newErrors[key as keyof FormErrors] = error;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      toast.error("Please fix the errors in the form");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrors({ ...errors, confirmPassword: "Passwords do not match" });
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstname} ${form.lastname}`,
          email: form.email,
          password: form.password,
          role: form.role === "job_seeker" ? "user" : "user", // Map to backend role
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Account created successfully! Redirecting...");
        // Redirect based on role
        setTimeout(() => {
          if (data.user?.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/user");
          }
        }, 1000);
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*()_+\-=\[\]{};&apos;:"\\|,.<>\/?]/.test(form.password),
  }

  const strengthScore = Object.values(passwordStrength).filter(Boolean).length

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white font-bold text-xl shadow-lg">
                S
              </div>
              <span className="font-bold text-3xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] bg-clip-text text-transparent">
                SkillLink
              </span>
            </Link>
            <p className="text-gray-600 mt-2">Join Australia&apos;s Skilled Workforce Platform</p>
          </div>

          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Create Your Account</CardTitle>
              <p className="text-gray-600">
                Join thousands of skilled professionals finding opportunities across Australia
              </p>
            </CardHeader>

            <CardContent className="space-y-6 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">I am a</Label>
                  <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, role: "job_seeker" })}
                      className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                        form.role === "job_seeker"
                          ? "bg-white shadow-md text-[#B260E6]"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span className="font-medium">Worker</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, role: "employer" })}
                      className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                        form.role === "employer"
                          ? "bg-white shadow-md text-[#B260E6]"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Building className="h-4 w-4" />
                      <span className="font-medium">Employer</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstname" className="text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstname"
                      placeholder="John"
                      className={`h-12 border-gray-200 rounded-xl transition-colors ${
                        errors.firstname && touched.firstname
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "focus:border-[#B260E6] focus:ring-[#B260E6]"
                      }`}
                      value={form.firstname}
                      onChange={(e) => handleChange("firstname", e.target.value)}
                      onBlur={() => handleBlur("firstname")}
                      required
                    />
                    {errors.firstname && touched.firstname && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.firstname}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname" className="text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastname"
                      placeholder="Smith"
                      className={`h-12 border-gray-200 rounded-xl transition-colors ${
                        errors.lastname && touched.lastname
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "focus:border-[#B260E6] focus:ring-[#B260E6]"
                      }`}
                      value={form.lastname}
                      onChange={(e) => handleChange("lastname", e.target.value)}
                      onBlur={() => handleBlur("lastname")}
                      required
                    />
                    {errors.lastname && touched.lastname && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.lastname}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={`h-12 border-gray-200 rounded-xl transition-colors ${
                      errors.email && touched.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "focus:border-[#B260E6] focus:ring-[#B260E6]"
                    }`}
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    required
                  />
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className={`h-12 border-gray-200 rounded-xl transition-colors pr-12 ${
                        errors.password && touched.password
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "focus:border-[#B260E6] focus:ring-[#B260E6]"
                      }`}
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {form.password && (
                    <div className="space-y-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4].map((index) => (
                          <div
                            key={index}
                            className={`h-1 flex-1 rounded-full ${
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
                          <CheckCircle className={`h-3 w-3 ${passwordStrength.length ? "text-green-500" : "text-gray-300"}`} />
                          <span className={passwordStrength.length ? "text-green-600" : "text-gray-500"}>8+ characters</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className={`h-3 w-3 ${passwordStrength.uppercase ? "text-green-500" : "text-gray-300"}`} />
                          <span className={passwordStrength.uppercase ? "text-green-600" : "text-gray-500"}>Uppercase</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className={`h-3 w-3 ${passwordStrength.number ? "text-green-500" : "text-gray-300"}`} />
                          <span className={passwordStrength.number ? "text-green-600" : "text-gray-500"}>Number</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className={`h-3 w-3 ${passwordStrength.special ? "text-green-500" : "text-gray-300"}`} />
                          <span className={passwordStrength.special ? "text-green-600" : "text-gray-500"}>Special char</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className={`h-12 border-gray-200 rounded-xl transition-colors pr-12 ${
                        (errors.confirmPassword && touched.confirmPassword) || (form.confirmPassword && form.password !== form.confirmPassword)
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "focus:border-[#B260E6] focus:ring-[#B260E6]"
                      }`}
                      value={form.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      onBlur={() => handleBlur("confirmPassword")}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {(errors.confirmPassword && touched.confirmPassword) || (form.confirmPassword && form.password !== form.confirmPassword) ? (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.confirmPassword || "Passwords do not match"}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms" 
                    className="mt-1 rounded border-gray-300 text-[#B260E6] focus:ring-[#B260E6] transition-colors"
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <Link href="#" className="text-[#B260E6] hover:text-[#A050D6] font-medium transition-colors">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-[#B260E6] hover:text-[#A050D6] font-medium transition-colors">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
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
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-500 font-medium">Already have an account?</span>
                </div>
              </div>

              <div className="text-center">
                <Link 
                  href="/signin" 
                  className="inline-flex items-center text-[#B260E6] hover:text-[#A050D6] font-semibold transition-colors"
                >
                  Sign in to your account
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 mb-4">Trusted by Australian workers and employers</p>
            <div className="flex justify-center space-x-6 opacity-60">
              <div className="text-xs text-gray-600 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                Australian
              </div>
              <div className="text-xs text-gray-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </div>
              <div className="text-xs text-gray-600 flex items-center">
                <Star className="h-3 w-3 mr-1" />
                4.9/5 Rating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Benefits Section */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#B260E6] to-[#ED84A5]">
        <div className="absolute inset-0">
          <Image
            src="https://source.unsplash.com/1200x1600/?australian-construction,skilled-trades"
            alt="Australian skilled trades"
            fill
            className="object-cover mix-blend-overlay opacity-20"
            priority
          />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <div className="mb-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-2xl mb-6">
                {form.role === "employer" ? "🏢" : "👷"}
              </div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                {form.role === "employer" ? "Find Australia&apos;s Best Talent" : "Build Your Australian Career"}
              </h2>
              <p className="text-xl opacity-90 leading-relaxed">
                {form.role === "employer" 
                  ? "Connect with skilled Australian workers and grow your business with the right talent."
                  : "Join thousands of skilled professionals finding meaningful work across Australia."
                }
              </p>
            </div>

            {/* Dynamic Benefits Based on Role */}
            <div className="space-y-4">
              {form.role === "job_seeker" ? (
                <>
                  <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      💼
                    </div>
                    <div>
                      <h4 className="font-semibold">50,000+ Jobs</h4>
                      <p className="text-sm opacity-80">Active opportunities across Australia</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      🎯
                    </div>
                    <div>
                      <h4 className="font-semibold">Smart Matching</h4>
                      <p className="text-sm opacity-80">Get matched with jobs that fit your skills</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      📱
                    </div>
                    <div>
                      <h4 className="font-semibold">Easy Apply</h4>
                      <p className="text-sm opacity-80">One-click applications to save time</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      👥
                    </div>
                    <div>
                      <h4 className="font-semibold">100,000+ Workers</h4>
                      <p className="text-sm opacity-80">Skilled professionals across Australia</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      ⚡
                    </div>
                    <div>
                      <h4 className="font-semibold">Fast Hiring</h4>
                      <p className="text-sm opacity-80">Fill positions in days, not weeks</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      ✅
                    </div>
                    <div>
                      <h4 className="font-semibold">Verified Workers</h4>
                      <p className="text-sm opacity-80">All profiles are validated and reviewed</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Testimonial */}
            <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <p className="text-lg italic mb-4">
                {form.role === "employer" 
                  ? "SkillLink helped us find qualified electricians in Melbourne within 48 hours. The platform saved us weeks of recruitment time."
                  : "Within a week of joining SkillLink, I found a stable plumbing job in Sydney. The process was seamless and professional."
                }
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  {form.role === "employer" ? "👨‍💼" : "👷"}
                </div>
                <div>
                  <p className="font-semibold">
                    {form.role === "employer" ? "Sarah Johnson" : "Michael Chen"}
                  </p>
                  <p className="text-sm opacity-80">
                    {form.role === "employer" ? "Construction Manager, Melbourne" : "Plumber, Sydney"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}