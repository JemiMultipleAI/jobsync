"use client";

import { useState  } from "react"
import DashboardCard from "@/components/admin/DashboardCard";
import { motion } from "framer-motion"
import { Shield } from "lucide-react"
import { Button  } from "@/components/ui/button"  

import { Input  } from "@/components/ui/input"
import { Label  } from "@/components/ui/label"
import { Switch  } from "@/components/ui/switch"
import { Separator  } from "@/components/ui/separator"
import { Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
 } from "@/components/ui/select"
import { Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
 } from "@/components/ui/card"
import { Moon,  Sun } from "lucide-react"


export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [jobAlerts, setJobAlerts] = useState(true);
  const [language, setLanguage] = useState("en");

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10">
            <Shield className="h-6 w-6 text-[#B260E6]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and preferences.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Notification Preferences */}
      <DashboardCard
        title="Notification Preferences"
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
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="job-alerts">Job Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts for new job matches
              </p>
            </div>
            <Switch
              id="job-alerts"
              checked={jobAlerts}
              onCheckedChange={setJobAlerts}
            />
          </div>
        </div>
      </DashboardCard>

      {/* Privacy Settings */}
      <DashboardCard
        title="Privacy Settings"
        description="Manage your privacy and visibility preferences"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-visibility">Profile Visibility</Label>
            <Select value={profileVisibility} onValueChange={setProfileVisibility}>
              <SelectTrigger id="profile-visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Visible to all</SelectItem>
                <SelectItem value="registered">Registered Users Only</SelectItem>
                <SelectItem value="private">Private - Only visible to me</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Control who can view your profile
            </p>
          </div>
        </div>
      </DashboardCard>

      {/* Password Change */}
      <DashboardCard
        title="Password Change"
        description="Update your account password"
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
            <Button variant="outline">Update Password</Button>
          </div>
        </div>
      </DashboardCard>

      {/* Account Preferences */}
      <DashboardCard
        title="Account Preferences"
        description="Customize your account experience"
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
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select your preferred language
            </p>
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
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

