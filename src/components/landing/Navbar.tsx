"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  ChevronDown,
  LogOut,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/lib/hooks/useToast";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const toast = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string; profileImage?: string; role?: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await apiClient.get<{ user: { name: string; email: string; profileImage?: string; role: string } }>("/api/auth/profile");
        setUser(data.user);
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
      setIsLoggedIn(false);
      setUser(null);
      router.push("/");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const getDashboardPath = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "employer") return "/employer";
    return "/user";
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
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
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 hidden sm:block">
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
                className="flex items-center space-x-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-[#B260E6] dark:hover:text-[#B260E6] rounded-xl font-medium transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 group"
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
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#B260E6] focus:border-transparent outline-none transition-all bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </form>

          {/* Desktop Auth Buttons / User Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            {isLoggedIn && user ? (
              <>
                {/* Notification & Messages */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-600 dark:text-gray-400 hover:text-[#B260E6] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ED84A5] rounded-full border-2 border-white"></span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-600 dark:text-gray-400 hover:text-[#B260E6] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
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

                {/* User Avatar with Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">
                      <Avatar className="h-10 w-10">
                        {user.profileImage && (
                          <AvatarImage src={user.profileImage} alt={user.name} />
                        )}
                        <AvatarFallback className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white font-semibold text-sm">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left text-sm hidden xl:block">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
                        <div className="text-gray-500 dark:text-gray-400 capitalize">{user.role}</div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(getDashboardPath())}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/user/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    className="text-gray-700 dark:text-gray-300 hover:text-[#B260E6] hover:bg-gray-100 dark:hover:bg-gray-800 font-medium px-6 py-2 rounded-xl transition-all cursor-pointer"
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
              className="text-gray-600 dark:text-gray-400 md:hidden"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 dark:text-gray-400 hover:text-[#B260E6]"
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
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search jobs, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#B260E6] focus:border-transparent outline-none transition-all bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </form>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
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
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-[#B260E6] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-all duration-200"
              >
                {item.icon && (
                  <span className="text-[#ED84A5]">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {isLoggedIn && user ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-3 border-b border-gray-200 mb-3">
                    <Avatar className="h-10 w-10">
                      {user.profileImage && (
                        <AvatarImage src={user.profileImage} alt={user.name} />
                      )}
                      <AvatarFallback className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white font-semibold text-sm">
                        {getInitials(user.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Link href={getDashboardPath()} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start space-x-3 text-gray-700 dark:text-gray-300"
                    >
                      <User className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Button>
                  </Link>
                  <Link href="/user/profile" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start space-x-3 text-gray-700 dark:text-gray-300"
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start space-x-3 text-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full justify-center border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
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
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 px-4">
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
