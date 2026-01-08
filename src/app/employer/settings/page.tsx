"use client";

import { useState } from "react";
import DashboardCard from "@/components/admin/DashboardCard";
import { motion } from "framer-motion";
import { Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";

export default function EmployerSettingsPage() {
  const toast = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [applicationAlerts, setApplicationAlerts] = useState(true);

  const handleSavePreferences = async () => {
    try {
      // In production, save to backend
      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error("Failed to save settings");
    }
  };

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
            <SettingsIcon className="h-6 w-6 text-[#B260E6]" />
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
              <Label htmlFor="application-alerts">New Application Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new applications are received
              </p>
            </div>
            <Switch
              id="application-alerts"
              checked={applicationAlerts}
              onCheckedChange={setApplicationAlerts}
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSavePreferences}>Save Preferences</Button>
          </div>
        </div>
      </DashboardCard>

      {/* Account Information */}
      <DashboardCard
        title="Account Information"
        description="View your account details"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value="Employer" disabled />
          </div>
          <p className="text-sm text-muted-foreground">
            To change your account details, please contact support.
          </p>
        </div>
      </DashboardCard>
    </div>
  );
}


