"use client";

import { useState, useEffect } from "react"
import DashboardCard from "@/components/shared/DashboardCard";
import { motion } from "framer-motion"
import { Shield, Save } from "lucide-react"
import { Button  } from "@/components/ui/button"  
import { useToast } from "@/lib/hooks/useToast";
import { useTheme } from "@/lib/contexts/ThemeContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { apiClient } from "@/lib/api/client";

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
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [jobAlerts, setJobAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  // Local state for language selection - only applies on save
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "es" | "fr" | "de" | "zh">("en");

  useEffect(() => {
    // Load saved preferences
    const loadPreferences = async () => {
      try {
        const response = await apiClient.get<{ user?: any; preferences?: any }>("/api/auth/profile");
        const prefs = response.preferences || response.user?.preferences || {};
        if (prefs) {
          setEmailNotifications(prefs.emailNotifications ?? true);
          setPushNotifications(prefs.pushNotifications ?? true);
          setSmsNotifications(prefs.smsNotifications ?? false);
          setProfileVisibility(prefs.profileVisibility ?? "public");
          setJobAlerts(prefs.jobAlerts ?? true);
          // Set local language state from saved preference
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
          smsNotifications,
          profileVisibility,
          jobAlerts,
          darkMode: theme === "dark",
          language: selectedLanguage,
        },
      });
      // Only update the language context after successful save
      setLanguage(selectedLanguage);
      toast.success(t("settings.saveSuccess"));
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error(t("settings.saveError"));
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
            <Shield className="h-6 w-6 text-[#B260E6]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("settings.manageSettings")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Notification Preferences */}
      <DashboardCard
        title={t("settings.notificationPreferences")}
        description={t("settings.notificationDescription")}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">{t("settings.emailNotifications")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.emailNotificationsDesc")}
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
              <Label htmlFor="push-notifications">{t("settings.pushNotifications")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.pushNotificationsDesc")}
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
              <Label htmlFor="sms-notifications">{t("settings.smsNotifications")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.smsNotificationsDesc")}
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
              <Label htmlFor="job-alerts">{t("settings.jobAlerts")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.jobAlertsDesc")}
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
        title={t("settings.privacySettings")}
        description={t("settings.privacyDescription")}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-visibility">{t("settings.profileVisibility")}</Label>
            <Select value={profileVisibility} onValueChange={setProfileVisibility}>
              <SelectTrigger id="profile-visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">{t("settings.visibilityPublic")}</SelectItem>
                <SelectItem value="registered">{t("settings.visibilityRegistered")}</SelectItem>
                <SelectItem value="private">{t("settings.visibilityPrivate")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("settings.profileVisibilityDesc")}
            </p>
          </div>
        </div>
      </DashboardCard>

      {/* Password Change */}
      <DashboardCard
        title={t("settings.passwordChange")}
        description={t("settings.passwordDescription")}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{t("settings.currentPassword")}</Label>
            <Input
              id="current-password"
              type="password"
              placeholder={t("settings.enterCurrentPassword")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">{t("settings.newPassword")}</Label>
            <Input
              id="new-password"
              type="password"
              placeholder={t("settings.enterNewPassword")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t("settings.confirmPassword")}</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder={t("settings.confirmNewPassword")}
            />
          </div>
          <div className="flex justify-end">
            <Button variant="outline">{t("settings.updatePassword")}</Button>
          </div>
        </div>
      </DashboardCard>

      {/* Account Preferences */}
      <DashboardCard
        title={t("settings.accountPreferences")}
        description={t("settings.languageDescription")}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">{t("settings.darkMode")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.darkModeDescription")}
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
            <Label htmlFor="language">{t("settings.language")}</Label>
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
              {t("settings.languageDescription")}
            </p>
          </div>
          <Separator />
          <div className="flex justify-end pt-4">
            <Button onClick={handleSavePreferences} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? t("common.loading") : t("common.save")}
            </Button>
          </div>
        </div>
      </DashboardCard>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{t("settings.dangerZone")}</CardTitle>
          <CardDescription>
            {t("settings.dangerDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("settings.deleteAccount")}</p>
              <p className="text-sm text-muted-foreground">
                {t("settings.deleteAccountDesc")}
              </p>
            </div>
            <Button variant="destructive">{t("settings.deleteAccount")}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

