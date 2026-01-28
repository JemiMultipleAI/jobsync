"use client";

import { useState  } from "react"
import DashboardCard from "@/components/admin/DashboardCard";
import { motion } from "framer-motion"
import React from "react"
import { Button } from "@/components/ui/button";
import { Input  } from "@/components/ui/input"
import { Label  } from "@/components/ui/label"
import { Switch  } from "@/components/ui/switch"
import { Separator  } from "@/components/ui/separator"
import { Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
 } from "@/components/ui/card"
import { Save, 
  Moon, 
  Sun, 
  Settings as SettingsIcon, 
 } from "lucide-react"


export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 pb-2"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10">
          <SettingsIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your account settings and preferences.
          </p>
        </div>
      </motion.div>

      {/* Profile Settings */}
      <DashboardCard
        title="Profile Settings"
        description="Update your personal information"
        className="w-full"
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" defaultValue="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" defaultValue="Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              defaultValue="admin@jobsync.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+61 400 000 000"
              defaultValue="+61 400 000 000"
            />
          </div>
          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </DashboardCard>

      {/* Notification Settings */}
      <DashboardCard
        title="Notification Settings"
        description="Configure how you receive notifications"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in browser
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via SMS
              </p>
            </div>
            <Switch
              id="sms-notifications"
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>
        </div>
      </DashboardCard>

      {/* Appearance Settings */}
      <DashboardCard
        title="Appearance"
        description="Customize the look and feel"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark theme
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Security Settings */}
      <DashboardCard
        title="Security"
        description="Manage your account security settings"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="rounded-xl transition-transform duration-200 hover:scale-[1.02]"
            >
              Update Password
            </Button>
          </div>
        </div>
      </DashboardCard>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your admin account and all associated data
              </p>
            </div>
            <Button
              variant="destructive"
              className="rounded-xl transition-transform duration-200 hover:scale-[1.02]"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
