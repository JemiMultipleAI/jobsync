"use client";

import { useState, useEffect } from "react";
import DashboardCard from "@/components/shared/DashboardCard";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Save, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/lib/hooks/useToast";
import { useTheme } from "@/lib/contexts/ThemeContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { apiClient } from "@/lib/api/client";

export default function EmployerSettingsPage() {
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [applicationAlerts, setApplicationAlerts] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "es" | "fr" | "de" | "zh">("en");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const loadPreferences = async () => {
      try {
        const response = await apiClient.get<{ user?: any; preferences?: any }>("/api/auth/profile");
        const prefs = response.preferences || response.user?.preferences || {};
        if (prefs) {
          setEmailNotifications(prefs.emailNotifications ?? true);
          setPushNotifications(prefs.pushNotifications ?? true);
          setApplicationAlerts(prefs.applicationAlerts ?? true);
          if (prefs.language && ["en", "es", "fr", "de", "zh"].includes(prefs.language)) {
            setSelectedLanguage(prefs.language);
          }
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };
    loadPreferences();
  }, []);

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await apiClient.put("/api/auth/profile", {
        preferences: {
          emailNotifications,
          pushNotifications,
          applicationAlerts,
          darkMode: theme === "dark",
          language: selectedLanguage,
        },
      });
      // Only update the language context after successful save
      setLanguage(selectedLanguage);
      toast.success(t("settings.saveSuccess") || "Settings saved successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error(t("settings.saveError") || "Failed to save settings");
    } finally {
      setSaving(false);
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
        </div>
      </DashboardCard>

      {/* Account Preferences */}
      <DashboardCard
        title={t("settings.accountPreferences") || "Account Preferences"}
        description={t("settings.languageDescription") || "Customize your account preferences"}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">{t("settings.darkMode") || "Dark Mode"}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.darkModeDescription") || "Switch between light and dark theme"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="language">{t("settings.language") || "Language"}</Label>
            <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as "en" | "es" | "fr" | "de" | "zh")}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("settings.languageDescription") || "Select your preferred language"}
            </p>
          </div>
          <Separator />
          <div className="flex justify-end pt-4">
            <Button onClick={handleSavePreferences} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? (t("common.loading") || "Saving...") : (t("common.save") || "Save Preferences")}
            </Button>
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



