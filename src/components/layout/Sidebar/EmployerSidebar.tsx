"use client";

import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Building2,
  Settings,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { BaseSidebar, NavigationItem } from "./BaseSidebar";

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/employer",
    icon: LayoutDashboard,
    description: "Overview of your activity",
  },
  {
    name: "Jobs",
    href: "/employer/jobs",
    icon: Briefcase,
    description: "Post and manage jobs",
  },
  {
    name: "Applications",
    href: "/employer/applications",
    icon: FileText,
    description: "View job applications",
  },
  {
    name: "Browse Workers",
    href: "/employer/browse-workers",
    icon: Users,
    description: "Browse all available workers",
  },
  {
    name: "Candidates",
    href: "/employer/candidates",
    icon: Users,
    description: "Browse candidates",
  },
  {
    name: "Company",
    href: "/employer/company",
    icon: Building2,
    description: "Manage company profile",
  },
  {
    name: "Blogs",
    href: "/blog",
    icon: BookOpen,
    description: "Browse and create blog posts",
  },
  {
    name: "Chats",
    href: "/employer/chats",
    icon: MessageSquare,
    description: "Message workers and employers",
  },
  {
    name: "Settings",
    href: "/employer/settings",
    icon: Settings,
    description: "Account settings",
  },
];

interface EmployerSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function EmployerSidebar({ isOpen, onToggle }: EmployerSidebarProps) {
  return (
    <BaseSidebar
      navigation={navigation}
      isOpen={isOpen}
      onToggle={onToggle}
      basePath="/employer"
      footerText="Employer Portal"
      footerSubtext="Version 1.0.0"
    />
  );
}
