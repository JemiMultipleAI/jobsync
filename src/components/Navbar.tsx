"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useState } from "react";
import {
  Menu,
  X,
  User,
  Building,
  MapPin,
  Search,
  Bookmark,
  Bell,
  MessageCircle,
} from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would come from auth context

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <span className="font-bold text-2xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] bg-clip-text text-transparent">
                JobSync
              </span>
              <p className="text-xs text-gray-500 -mt-1 hidden sm:block">
                Australia
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { href: "/", label: "Home", icon: null },
              {
                href: "/jobs",
                label: "Find Jobs",
                icon: <Search className="h-4 w-4" />,
              },
              {
                href: "/companies",
                label: "Companies",
                icon: <Building className="h-4 w-4" />,
              },
              { href: "/about", label: "About", icon: null },
              { href: "/contact", label: "Contact", icon: null },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-[#B260E6] rounded-xl font-medium transition-all duration-200 hover:bg-gray-100 group"
              >
                {item.icon && (
                  <span className="text-[#ED84A5] group-hover:text-[#B260E6]">
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B260E6] focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
              />
            </div>
          </div>

          {/* Desktop Auth Buttons / User Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                {/* Notification & Messages */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-600 hover:text-[#B260E6] hover:bg-gray-100 rounded-xl"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ED84A5] rounded-full border-2 border-white"></span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-600 hover:text-[#B260E6] hover:bg-gray-100 rounded-xl"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-[#B260E6] hover:bg-gray-100 rounded-xl"
                >
                  <Bookmark className="h-5 w-5" />
                </Button>

                {/* User Avatar */}
                <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                    MC
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">Michael</div>
                    <div className="text-gray-500">Electrician</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-[#B260E6] hover:bg-gray-100 font-medium px-6 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="cursor-pointer bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white font-medium px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Sign Up Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Mobile Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 md:hidden"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-[#B260E6]"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search jobs, companies..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B260E6] focus:border-transparent outline-none transition-all bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {[
              { href: "/", label: "Home", icon: null },
              {
                href: "/jobs",
                label: "Find Jobs",
                icon: <Search className="h-5 w-5" />,
              },
              {
                href: "/companies",
                label: "Companies",
                icon: <Building className="h-5 w-5" />,
              },
              { href: "/about", label: "About", icon: null },
              { href: "/contact", label: "Contact", icon: null },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-[#B260E6] hover:bg-gray-50 rounded-xl font-medium transition-all duration-200"
              >
                {item.icon && (
                  <span className="text-[#ED84A5]">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {isLoggedIn ? (
                <>
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start space-x-3 text-gray-700"
                    >
                      <User className="h-5 w-5" />
                      <span>My Profile</span>
                    </Button>
                  </Link>
                  <Link href="/saved" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start space-x-3 text-gray-700"
                    >
                      <Bookmark className="h-5 w-5" />
                      <span>Saved Jobs</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full justify-center border-gray-300 text-gray-700"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button className="w-full justify-center bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white">
                      Sign Up Free
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Location Indicator */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-500 px-4">
                <MapPin className="h-4 w-4 text-[#ED84A5]" />
                <span>Serving Australian workers nationwide</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
