"use client";

import { BaseNavbar, NavbarMenuItem } from "./BaseNavbar";
import { SearchAutocomplete } from "@/components/features/search/SearchAutocomplete";
import { User, Settings } from "lucide-react";

export default function UserNavbar() {
  // Fallback translations if LanguageContext is not available
  const t = (key: string) => {
    const translations: Record<string, string> = {
      "nav.profile": "Profile",
      "nav.settings": "Settings",
      "nav.search": "Search jobs, companies...",
      "nav.user": "User",
      "nav.applicationStatusUpdated": "Application status updated",
      "nav.minutesAgo": "minutes ago",
      "nav.newJobMatches": "New job matches",
      "nav.hourAgo": "hour ago",
      "nav.companyViewedProfile": "Company viewed your profile",
      "nav.hoursAgo": "hours ago",
    };
    return translations[key] || key;
  };

  const menuItems: NavbarMenuItem[] = [
    { label: t("nav.profile"), href: "/user/profile", icon: User },
    { label: t("nav.settings"), href: "/user/settings", icon: Settings },
  ];

  const notifications = [
    { title: t("nav.applicationStatusUpdated"), time: `5 ${t("nav.minutesAgo")}` },
    { title: t("nav.newJobMatches"), time: `1 ${t("nav.hourAgo")}` },
    { title: t("nav.companyViewedProfile"), time: `2 ${t("nav.hoursAgo")}` },
  ];

  return (
    <BaseNavbar
      searchComponent={<SearchAutocomplete placeholder={t("nav.search")} />}
      notifications={notifications}
      notificationCount={3}
      menuItems={menuItems}
      userFallbackName={t("nav.user")}
    />
  );
}
