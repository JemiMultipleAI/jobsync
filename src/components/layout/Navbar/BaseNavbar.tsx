"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, LogOut, Settings, LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { getInitials } from "@/lib/utils/user";
import Link from "next/link";

export interface NavbarMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface Notification {
  title: string;
  time: string;
}

export interface BaseNavbarProps {
  searchComponent?: ReactNode;
  notifications?: Notification[];
  notificationCount?: number;
  menuItems: NavbarMenuItem[];
  userFallbackName?: string;
  className?: string;
}

export function BaseNavbar({
  searchComponent,
  notifications: staticNotifications = [],
  notificationCount: staticNotificationCount = 0,
  menuItems,
  userFallbackName = "User",
  className,
}: BaseNavbarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  // Always call hooks to maintain hook order
  const notificationsResult = useNotifications();
  const wsNotifications = user ? (notificationsResult.notifications || []) : [];
  const unreadCount = user ? (notificationsResult.unreadCount || 0) : 0;
  const markAsRead = notificationsResult.markAsRead || (() => {});
  
  // Combine static and WebSocket notifications
  const allNotifications = [...wsNotifications.map(n => ({
    title: n.title,
    time: n.timestamp.toLocaleTimeString(),
  })), ...staticNotifications];
  const totalNotificationCount = unreadCount + staticNotificationCount;

  return (
    <header
      className={`sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 px-6 shadow-sm ${className || ""}`}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-3 group shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
          J
        </div>
        <span className="font-bold text-2xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] bg-clip-text text-transparent">
          JobSync
        </span>
      </Link>

      {/* Search */}
      {searchComponent && (
        <div className="relative flex-1 max-w-md">
          {searchComponent}
        </div>
      )}

      <div className="ml-auto flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative transition-transform duration-200 hover:scale-105"
            >
              <Bell className="h-5 w-5" />
              {totalNotificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {totalNotificationCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80" onOpenAutoFocus={markAsRead}>
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2 max-h-96 overflow-y-auto">
              {allNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">No new notifications</p>
              ) : (
                <div className="space-y-2">
                  {allNotifications.map((notification, index) => (
                    <div key={index} className="text-sm p-2 rounded-lg bg-muted/50">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full transition-transform duration-200 hover:scale-105 ring-2 ring-transparent hover:ring-primary/20"
            >
              <Avatar className="h-9 w-9 ring-2 ring-transparent hover:ring-primary/30 transition-all">
                {user?.profileImage && (
                  <AvatarImage src={user.profileImage} alt={user.name || userFallbackName} />
                )}
                <AvatarFallback className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white font-semibold">
                  {getInitials(user?.name || userFallbackName)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || userFallbackName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={index} onClick={() => router.push(item.href)}>
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
