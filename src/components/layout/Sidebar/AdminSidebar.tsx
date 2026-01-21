"use client";

import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  BarChart3,
  Settings,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { BaseSidebar, NavigationItem } from "./BaseSidebar";

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Platform overview",
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Manage user accounts",
  },
  {
    name: "Jobs",
    href: "/admin/jobs",
    icon: Briefcase,
    description: "Manage job postings",
  },
  {
    name: "Companies",
    href: "/admin/companies",
    icon: Building2,
    description: "Manage employers",
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "View insights",
  },
  {
    name: "Career Content",
    href: "/admin/career-content",
    icon: BookOpen,
    description: "Manage articles & programs",
  },
  {
    name: "Chats",
    href: "/admin/chats",
    icon: MessageSquare,
    description: "Message users and employers",
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "System configuration",
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  return (
    <BaseSidebar
      navigation={navigation}
      isOpen={isOpen}
      onToggle={onToggle}
      basePath="/admin"
      footerText="Admin Portal"
      footerSubtext="Version 1.0.0"
    />
  );
}
