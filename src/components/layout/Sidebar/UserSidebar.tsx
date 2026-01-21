"use client";

import {
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Briefcase,
  Building2,
  Settings,
  GraduationCap,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { BaseSidebar, NavigationItem } from "./BaseSidebar";

interface UserSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

// Fallback translation function if LanguageContext is not available
const t = (key: string) => {
  const translations: Record<string, string> = {
    "sidebar.dashboard": "Dashboard",
    "sidebar.dashboardDesc": "Overview of your activity",
    "sidebar.profile": "Profile",
    "sidebar.profileDesc": "Manage your profile",
    "sidebar.applications": "Applications",
    "sidebar.applicationsDesc": "View your job applications",
    "sidebar.savedJobs": "Saved Jobs",
    "sidebar.savedJobsDesc": "Jobs you've bookmarked",
    "sidebar.browseJobs": "Browse Jobs",
    "sidebar.browseJobsDesc": "Search for job opportunities",
    "sidebar.companies": "Companies",
    "sidebar.companiesDesc": "Browse companies",
    "sidebar.settings": "Settings",
    "sidebar.settingsDesc": "Account settings",
    "sidebar.userPortal": "User Portal",
  };
  return translations[key] || key;
};

export default function UserSidebar({ isOpen, onToggle }: UserSidebarProps) {

  const navigation: NavigationItem[] = [
    {
      name: t("sidebar.dashboard"),
      href: "/user",
      icon: LayoutDashboard,
      description: t("sidebar.dashboardDesc"),
    },
    {
      name: t("sidebar.profile"),
      href: "/user/profile",
      icon: User,
      description: t("sidebar.profileDesc"),
    },
    {
      name: t("sidebar.applications"),
      href: "/user/applications",
      icon: FileText,
      description: t("sidebar.applicationsDesc"),
    },
    {
      name: t("sidebar.savedJobs"),
      href: "/user/saved-jobs",
      icon: Bookmark,
      description: t("sidebar.savedJobsDesc"),
    },
    {
      name: t("sidebar.browseJobs"),
      href: "/user/jobs",
      icon: Briefcase,
      description: t("sidebar.browseJobsDesc"),
    },
    {
      name: t("sidebar.companies"),
      href: "/user/companies",
      icon: Building2,
      description: t("sidebar.companiesDesc"),
    },
    {
      name: "Skills Training",
      href: "/user/training-programs",
      icon: GraduationCap,
      description: "Browse and enroll in training programs",
    },
    {
      name: "Blogs",
      href: "/blog",
      icon: BookOpen,
      description: "Browse and create blog posts",
    },
    {
      name: "Chats",
      href: "/user/chats",
      icon: MessageSquare,
      description: "Message other users",
    },
    {
      name: t("sidebar.settings"),
      href: "/user/settings",
      icon: Settings,
      description: t("sidebar.settingsDesc"),
    },
  ];

  return (
    <BaseSidebar
      navigation={navigation}
      isOpen={isOpen}
      onToggle={onToggle}
      basePath="/user"
      footerText={t("sidebar.userPortal")}
      footerSubtext="Version 1.0.0"
    />
  );
}
