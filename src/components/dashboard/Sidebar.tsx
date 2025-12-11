"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Briefcase,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    name: "Dashboard",
    href: "/user",
    icon: LayoutDashboard,
    description: "Overview of your activity",
  },
  {
    name: "Profile",
    href: "/user/profile",
    icon: User,
    description: "Manage your profile",
  },
  {
    name: "Applications",
    href: "/user/applications",
    icon: FileText,
    description: "Track your applications",
  },
  {
    name: "Saved Jobs",
    href: "/user/saved-jobs",
    icon: Bookmark,
    description: "View saved positions",
  },
  {
    name: "Browse Jobs",
    href: "/user/jobs",
    icon: Briefcase,
    description: "Discover opportunities",
  },
  {
    name: "Companies",
    href: "/user/companies",
    icon: Building2,
    description: "Explore employers",
  },
  {
    name: "Settings",
    href: "/user/settings",
    icon: Settings,
    description: "Account preferences",
  },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Detect mobile screen size - only after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent toggle on mobile when trying to open
  const handleToggle = () => {
    if (isMobile && !isOpen) {
      return; // Prevent opening on mobile
    }
    onToggle();
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isOpen ? 256 : 96, // 256px (w-64) when open, 96px when closed
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 h-screen border-r border-border bg-card shadow-lg overflow-hidden"
    >
      <div className="flex h-full flex-col">
        {/* Logo & Toggle Button */}
        <div className="flex h-16 items-center border-b border-border px-2">
          {isOpen ? (
            <>
              {/* Open state - Logo on left, button on right */}
              <div className="flex flex-1 items-center px-4">
                <Link href="/" className="flex items-center space-x-3" suppressHydrationWarning>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white font-bold text-lg shadow-lg shrink-0">
                    J
                  </div>
                  <span className="font-bold text-xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] bg-clip-text text-transparent whitespace-nowrap">
                    JobSync
                  </span>
                </Link>
              </div>
              <div className="flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggle}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Closed state - Logo and button side by side with space */}
              <div className="flex w-full items-center justify-between gap-2 px-2">
                <Link href="/" className="flex-shrink-0" suppressHydrationWarning>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white font-bold text-lg shadow-lg">
                    J
                  </div>
                </Link>
                {/* Button only shows on desktop when closed - only render after mount to avoid hydration mismatch */}
                {mounted && !isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggle}
                    className="h-7 w-7 flex-shrink-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {navigation.map((item) => {
            // Dashboard should only be active on exact /dashboard route
            // Other routes should be active when pathname starts with their href
            const isActive =
              item.href === "/user"
                ? pathname === "/user"
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center rounded-lg text-sm font-medium transition-all duration-200",
                  isOpen
                    ? "space-x-3 px-3 py-2.5"
                    : "justify-center px-2 py-2.5",
                  isActive
                    ? "bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10 text-[#B260E6] shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                title={!isOpen ? `${item.name} - ${item.description}` : undefined}
                suppressHydrationWarning
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive
                      ? "text-[#B260E6]"
                      : "text-muted-foreground group-hover:text-accent-foreground"
                  )}
                />
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative z-10 flex flex-col min-w-0 flex-1"
                    >
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground/70 whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.description}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-2">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="footer-expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-lg bg-muted/50 p-2 text-center text-xs text-muted-foreground"
              >
                <p className="font-medium">User Portal</p>
                <p className="mt-0.5 text-[10px]">Version 1.0.0</p>
              </motion.div>
            ) : (
              <motion.div
                key="footer-collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-lg bg-muted/50 p-1.5 text-center"
              >
                <p className="text-[9px] font-medium text-muted-foreground">
                  V1.0
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
