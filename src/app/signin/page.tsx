"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, LogIn, Building, User, ArrowRight } from "lucide-react"
import { useState } from "react"

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState("worker") // "worker" or "employer"

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
            <p className="text-gray-600 mt-2">Australia&apos;s Skilled Workforce Platform</p>
          </div>

          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
              <p className="text-gray-600">Sign in to access your Australian career opportunities</p>
            </CardHeader>

            <CardContent className="space-y-6 p-8">
              {/* User Type Selection */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUserType("worker")}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                    userType === "worker"
                      ? "bg-white shadow-md text-[#B260E6]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">Worker</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("employer")}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                    userType === "employer"
                      ? "bg-white shadow-md text-[#B260E6]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Building className="h-4 w-4" />
                  <span className="font-medium">Employer</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    className="h-12 border-gray-200 rounded-xl focus:border-[#B260E6] focus:ring-[#B260E6] transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <Link href="#" className="text-sm text-[#ED84A5] hover:text-[#DD74A5] font-medium transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter your password" 
                      className="h-12 border-gray-200 rounded-xl focus:border-[#B260E6] focus:ring-[#B260E6] transition-colors pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    className="rounded border-gray-300 text-[#B260E6] focus:ring-[#B260E6] transition-colors" 
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me for 30 days
                  </Label>
                </div>
              </div>

              <Button className="w-full h-12 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant="outline" 
                  className="h-12 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
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
              </div>

              <div className="text-center text-sm pt-4">
                <span className="text-gray-600">Don&apos;t have an account? </span>
                <Link 
                  href="/signup" 
                  className="text-[#B260E6] hover:text-[#A050D6] font-semibold transition-colors inline-flex items-center"
                >
                  Sign up now
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 mb-4">Trusted by Australian workers and employers</p>
            <div className="flex justify-center space-x-6 opacity-60">
              <div className="text-xs text-gray-600">🔒 Secure</div>
              <div className="text-xs text-gray-600">✅ Verified</div>
              <div className="text-xs text-gray-600">🇦🇺 Australian</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image Section */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#B260E6] to-[#ED84A5]">
        <div className="absolute inset-0">
          <Image
            src="https://source.unsplash.com/1200x1600/?australian-worker,construction-australia"
            alt="Australian skilled worker"
            fill
            className="object-cover mix-blend-overlay opacity-20"
            priority
          />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <div className="mb-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-2xl mb-6">
                👷
              </div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Join Australia&apos;s{" "}
                <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Skilled Workforce
                </span>
              </h2>
              <p className="text-xl opacity-90 leading-relaxed">
                Connect with thousands of job opportunities and build your career with Australia&apos;s leading trades platform.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
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
                  🏢
                </div>
                <div>
                  <h4 className="font-semibold">2,000+ Companies</h4>
                  <p className="text-sm opacity-80">Trusted Australian employers</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  ⭐
                </div>
                <div>
                  <h4 className="font-semibold">4.9/5 Rating</h4>
                  <p className="text-sm opacity-80">From our Australian community</p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <p className="text-lg italic mb-4">
                SkillLink helped me find stable electrical work in Melbourne within days. The platform connects you with real opportunities
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  👨‍💼
                </div>
                <div>
                  <p className="font-semibold">Michael Chen</p>
                  <p className="text-sm opacity-80">Electrician, Melbourne</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}