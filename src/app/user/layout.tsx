"use client";

import { useState,  useEffect  } from "react"
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";

import { motion } from "framer-motion";

const MOBILE_BREAKPOINT = 768; // md breakpoint in Tailwind

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start closed on mobile
  const [mounted, setMounted] = useState(false);

  // Handle responsive behavior - only after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

      if (isMobile) {
        // Close sidebar on mobile screens
        setIsSidebarOpen(false);
      } else {
        // Open sidebar on desktop screens if it was previously open
        // You can set it to true if you want it open by default on desktop
        const wasOpen =
          sessionStorage.getItem("dashboardSidebarOpen") === "true";
        setIsSidebarOpen(wasOpen);
      }
    };

    // Check initial screen size - only after mount
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (!isMobile) {
      // On desktop, check if sidebar was open before
      const wasOpen = sessionStorage.getItem("dashboardSidebarOpen") === "true";
      setIsSidebarOpen(wasOpen || true); // Default to open on desktop
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save sidebar state to sessionStorage when it changes (only on desktop)
  useEffect(() => {
    if (window.innerWidth >= MOBILE_BREAKPOINT) {
      sessionStorage.setItem("dashboardSidebarOpen", isSidebarOpen.toString());
    }
  }, [isSidebarOpen]);

 

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <motion.div
        initial={false}
        animate={{
          marginLeft: isSidebarOpen ? 256 : 96, // Match sidebar width (256px when open, 96px when closed)
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-1 flex-col overflow-hidden min-w-0"
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="w-full px-4 md:px-6 py-6">
            <motion.div
              key={isSidebarOpen ? "open" : "closed"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="mx-auto max-w-7xl space-y-6"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </motion.div>
    </div>
  );
}
