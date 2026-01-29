"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BaseNavbar, NavbarMenuItem } from "./BaseNavbar";
import { User, Settings } from "lucide-react";

export default function EmployerNavbar() {
  const menuItems: NavbarMenuItem[] = [
    { label: "Profile", href: "/employer/company", icon: User },
    { label: "Settings", href: "/employer/settings", icon: Settings },
  ];

  const notifications = [
    { title: "New job application", time: "5 minutes ago" },
    { title: "Job posted successfully", time: "1 hour ago" },
    { title: "Candidate viewed your job", time: "2 hours ago" },
  ];

  const searchComponent = (
    <>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search jobs, candidates..."
        className="h-9 w-full pl-10 pr-4 rounded-xl bg-background/50 border-border/50 focus:bg-background transition-colors"
      />
    </>
  );

  return (
    <BaseNavbar
      searchComponent={searchComponent}
      notifications={notifications}
      notificationCount={3}
      menuItems={menuItems}
      userFallbackName="Employer"
    />
  );
}
