"use client";

import { useState, useEffect, useCallback } from "react"
import DashboardCard from "@/components/shared/DashboardCard";
import { User } from "lucide-react"
import React from "react"
import { X } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Briefcase } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Upload,
  Save,
  Camera,
  MapPin,
  Phone,
  Mail,
  Download,
  Award,
  CreditCard,
  Building,
  FileText,
  Lock,
  Sparkles,
} from "lucide-react"
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { useLanguage } from "@/lib/contexts/LanguageContext";


export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  interface UserProfile {
    _id: string;
    name: string;
    email: string;
    bio?: string;
    phone?: string;
    location?: string;
    skills: string[];
    profileImage?: string;
    resume?: string;
    profileCompletion: number;
    bankDetails?: {
      accountName?: string;
      bsb?: string;
      accountNumber?: string;
    };
    superannuation?: {
      fundName?: string;
      memberNumber?: string;
      usi?: string;
    };
    taxFileNumber?: string;
    badges?: Array<{
      trainingProgramId: string;
      badgeName: string;
      badgeIcon?: string;
      completedAt: string;
    }>;
  }
  const [user, setUser] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [_mounted, setMounted] = useState(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phone: "",
    location: "",
    bankDetails: {
      accountName: "",
      bsb: "",
      accountNumber: "",
    },
    superannuation: {
      fundName: "",
      memberNumber: "",
      usi: "",
    },
    taxFileNumber: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<{ user: UserProfile }>("/api/auth/profile");
      
      if (!data || !data.user) {
        throw new Error("Invalid response from server");
      }

      setUser(data.user);
      setFormData({
        name: data.user.name || "",
        bio: data.user.bio || "",
        phone: data.user.phone || "",
        location: data.user.location || "",
        bankDetails: {
          accountName: data.user.bankDetails?.accountName || "",
          bsb: data.user.bankDetails?.bsb || "",
          accountNumber: data.user.bankDetails?.accountNumber || "",
        },
        superannuation: {
          fundName: data.user.superannuation?.fundName || "",
          memberNumber: data.user.superannuation?.memberNumber || "",
          usi: data.user.superannuation?.usi || "",
        },
        taxFileNumber: data.user.taxFileNumber || "",
      });
      setSkills(Array.isArray(data.user.skills) ? data.user.skills : []);
    } catch (error) {
      console.error("Error fetching profile:", error);
      const errorMessage = error instanceof Error ? error.message : "";
      
      // Log more details in development
      if (process.env.NODE_ENV === "development") {
        console.error("Full error details:", {
          message: errorMessage,
          error: error,
        });
      }
      
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("Authentication")) {
        toast.error("Please log in again");
        setTimeout(() => {
          router.push("/auth/login");
        }, 1000);
        return;
      }
      
      // Show more specific error message
      const displayMessage = errorMessage || t("profile.failedToLoad");
      toast.error(displayMessage);
    } finally {
      setLoading(false);
    }
  }, [router, toast, t]);

  useEffect(() => {
    setMounted(true);
    fetchProfile();
  }, [fetchProfile]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updateData: Record<string, unknown> = {};

      if (formData.name) updateData.name = formData.name;
      if (formData.bio !== undefined) updateData.bio = formData.bio;
      if (formData.phone) updateData.phone = formData.phone;
      if (formData.location) updateData.location = formData.location;
      if (skills) updateData.skills = skills;
      
      // Financial information - only include if at least one field has a value
      const hasBankDetails = formData.bankDetails.accountName?.trim() || 
                             formData.bankDetails.bsb?.trim() || 
                             formData.bankDetails.accountNumber?.trim();
      if (hasBankDetails) {
        updateData.bankDetails = {
          ...(formData.bankDetails.accountName?.trim() && { accountName: formData.bankDetails.accountName.trim() }),
          ...(formData.bankDetails.bsb?.trim() && { bsb: formData.bankDetails.bsb.trim() }),
          ...(formData.bankDetails.accountNumber?.trim() && { accountNumber: formData.bankDetails.accountNumber.trim() }),
        };
      }
      
      const hasSuperannuation = formData.superannuation.fundName?.trim() || 
                                 formData.superannuation.memberNumber?.trim() || 
                                 formData.superannuation.usi?.trim();
      if (hasSuperannuation) {
        updateData.superannuation = {
          ...(formData.superannuation.fundName?.trim() && { fundName: formData.superannuation.fundName.trim() }),
          ...(formData.superannuation.memberNumber?.trim() && { memberNumber: formData.superannuation.memberNumber.trim() }),
          ...(formData.superannuation.usi?.trim() && { usi: formData.superannuation.usi.trim() }),
        };
      }
      
      if (formData.taxFileNumber?.trim()) {
        updateData.taxFileNumber = formData.taxFileNumber.trim();
      }
      
      console.log("[Profile Save] Sending update data:", JSON.stringify(updateData, null, 2));

      const data = await apiClient.put<{ message?: string; user: UserProfile }>("/api/auth/profile", updateData);

      if (data.user) {
        setUser(data.user);
        setFormData({
          name: data.user.name || "",
          bio: data.user.bio || "",
          phone: data.user.phone || "",
          location: data.user.location || "",
          bankDetails: {
            accountName: data.user.bankDetails?.accountName || "",
            bsb: data.user.bankDetails?.bsb || "",
            accountNumber: data.user.bankDetails?.accountNumber || "",
          },
          superannuation: {
            fundName: data.user.superannuation?.fundName || "",
            memberNumber: data.user.superannuation?.memberNumber || "",
            usi: data.user.superannuation?.usi || "",
          },
          taxFileNumber: data.user.taxFileNumber || "",
        });
        setSkills(data.user.skills || []);
        toast.success(t("profile.updated"));
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Profile save error:", error);
      
      // Try to extract detailed error information
      let errorMessage = "Failed to update profile";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check if it's a validation error with details
        try {
          const errorObj = error as { details?: Array<{ path: string | string[]; message: string }>; message?: string };
          if (errorObj.details && Array.isArray(errorObj.details)) {
            const details = errorObj.details.map((d) => {
              const path = Array.isArray(d.path) ? d.path.join(".") : d.path;
              return `${path}: ${d.message}`;
            }).join(", ");
            errorMessage = `Validation error: ${details}`;
          }
        } catch {
          // If parsing fails, use the original error message
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await apiClient.upload<{ profileImage: string; profileCompletion: number }>(
        "/api/auth/upload/profile-image",
        formData
      );

      if (user) {
        setUser({ ...user, profileImage: data.profileImage, profileCompletion: data.profileCompletion });
      }
      toast.success(t("profile.imageUploaded"));
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      toast.error(errorMessage);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a PDF, DOC, or DOCX file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await apiClient.upload<{ resume: string; profileCompletion: number }>(
        "/api/auth/upload/resume",
        formData
      );

      if (user) {
        setUser({ ...user, resume: data.resume, profileCompletion: data.profileCompletion });
      }
      toast.success(t("profile.resumeUploadedSuccess"));
    } catch (error) {
      console.error("Error uploading resume:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload resume";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t("profile.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("profile.failedToLoad")}</p>
      </div>
    );
  }

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
            <User className="h-6 w-6 text-[#B260E6]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("profile.title")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("profile.description")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profile Completion */}
      <DashboardCard title={t("profile.completion")} description={t("profile.completionDesc")}>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("profile.progress")}</span>
            <span className="font-semibold">{user.profileCompletion || 0}%</span>
          </div>
          <Progress value={user.profileCompletion || 0} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {t("profile.completionHint")}
          </p>
        </div>
      </DashboardCard>

      {/* Profile Picture */}
      <DashboardCard title={t("profile.picture")} description={t("profile.pictureDesc")}>
        <div className="flex items-center gap-6">
          <div className="relative">
            {user.profileImage ? (
              <div className="relative h-24 w-24 rounded-full overflow-hidden shadow-lg">
                <Image
                  src={user.profileImage}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white text-2xl font-bold shadow-lg">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => document.getElementById("profile-image-upload")?.click()}
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-background bg-background shadow-md hover:scale-105 transition-transform cursor-pointer z-10"
            >
              <Camera className="h-4 w-4" />
            </Button>
            <input
              id="profile-image-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("profile-image-upload")?.click()}
              className="w-full sm:w-auto cursor-pointer"
            >
              <Upload className="mr-2 h-4 w-4" />
              {t("profile.uploadPhoto")}
            </Button>
            <p className="text-xs text-muted-foreground">
              {t("profile.pictureHint")}
            </p>
          </div>
        </div>
      </DashboardCard>

      {/* Personal Information */}
      <DashboardCard title={t("profile.personalInfo")} description={t("profile.personalInfoDesc")}>
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("profile.fullName")}</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="mr-2 inline h-4 w-4" />
                {t("profile.email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="mr-2 inline h-4 w-4" />
                {t("profile.phone")}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+61 400 000 000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">
              <MapPin className="mr-2 inline h-4 w-4" />
              {t("profile.location")}
            </Label>
            <Input
              id="location"
              placeholder="Sydney, Australia"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <Button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className="ml-auto bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]"
          >
            <Save className="mr-2 h-4 w-4"/>
            {saving ? t("profile.saving") : t("profile.saveChanges")}
          </Button>
        </div>
      </DashboardCard>

      {/* Bio/Summary */}
      <DashboardCard title={t("profile.professionalSummary")} description={t("profile.professionalSummaryDesc")}>
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">{t("profile.bio")}</Label>
            <Textarea
              id="bio"
              placeholder={t("profile.bioPlaceholder")}
              className="min-h-32"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {500 - (formData.bio?.length || 0)} {t("profile.charactersRemaining")}
            </p>
          </div>
          <Button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className="ml-auto bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? t("profile.saving") : t("profile.saveBio")}
          </Button>
        </div>
      </DashboardCard>

      {/* Skills */}
      <DashboardCard title={t("profile.skills")} description={t("profile.skillsDesc")}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="px-3 py-1.5 text-sm flex items-center gap-2"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-1 rounded-full hover:bg-destructive/20 p-0.5 transition-colors bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={t("profile.addSkill")}
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={addSkill}
              variant="outline"
            >
              {t("profile.add")}
            </Button>
          </div>
        </div>
      </DashboardCard>

      {/* Training Badges */}
      {user.badges && user.badges.length > 0 && (
        <DashboardCard title="Training Badges" description="Badges earned from completing training programs">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.badges.map((badge, index) => (
                <Card key={index} className="bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10 border border-[#B260E6]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {badge.badgeIcon ? (
                        <img src={badge.badgeIcon} alt={badge.badgeName} className="h-12 w-12 rounded-lg" />
                      ) : (
                        <div className="h-12 w-12 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-lg flex items-center justify-center">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{badge.badgeName}</p>
                        <p className="text-xs text-gray-600">
                          Completed {new Date(badge.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              These badges are visible to employers when they view your profile.
            </p>
          </div>
        </DashboardCard>
      )}

      {/* Financial Information */}
      <DashboardCard 
        title="Financial Information" 
        description="Provide your bank details, superannuation, and tax file number for payroll processing when you get hired"
      >
        <div className="space-y-6">
          {/* Bank Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-[#B260E6]" />
              <h3 className="font-semibold text-lg">Bank Details</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="John Doe"
                  value={formData.bankDetails.accountName}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, accountName: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bsb">BSB (6 digits)</Label>
                <Input
                  id="bsb"
                  placeholder="123456"
                  maxLength={6}
                  value={formData.bankDetails.bsb}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, bsb: value }
                    });
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="12345678"
                value={formData.bankDetails.accountNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, accountNumber: value }
                  });
                }}
              />
            </div>
          </div>

          {/* Superannuation */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-5 w-5 text-[#B260E6]" />
              <h3 className="font-semibold text-lg">Superannuation</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fundName">Fund Name</Label>
                <Input
                  id="fundName"
                  placeholder="e.g., AustralianSuper"
                  value={formData.superannuation.fundName}
                  onChange={(e) => setFormData({
                    ...formData,
                    superannuation: { ...formData.superannuation, fundName: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberNumber">Member Number</Label>
                <Input
                  id="memberNumber"
                  placeholder="Member number"
                  value={formData.superannuation.memberNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    superannuation: { ...formData.superannuation, memberNumber: e.target.value }
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usi">USI (Unique Superannuation Identifier) - Optional</Label>
              <Input
                id="usi"
                placeholder="USI (if applicable)"
                value={formData.superannuation.usi}
                onChange={(e) => setFormData({
                  ...formData,
                  superannuation: { ...formData.superannuation, usi: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Tax File Number */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-[#B260E6]" />
              <h3 className="font-semibold text-lg">Tax File Number</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxFileNumber">Tax File Number (9 digits)</Label>
              <Input
                id="taxFileNumber"
                type="password"
                placeholder="123456789"
                maxLength={9}
                value={formData.taxFileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                  setFormData({ ...formData, taxFileNumber: value });
                }}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Your Tax File Number is encrypted and only visible to you and employers when you are hired.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className="ml-auto bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? t("profile.saving") : "Save Financial Information"}
          </Button>
        </div>
      </DashboardCard>

      {/* Resume/CV */}
      <DashboardCard 
        title={t("profile.resume")} 
        description="Upload a resume or use our AI-powered resume builder to create one (Optional)"
      >
        <div className="space-y-4">
          {/* AI Resume Builder Option */}
          <Card className="border-2 border-dashed border-[#B260E6] bg-gradient-to-r from-[#B260E6]/5 to-[#ED84A5]/5">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5] mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm font-medium mb-1">AI Resume Builder</p>
              <p className="text-xs text-muted-foreground mb-4 text-center">
                Create a professional resume with AI-powered suggestions based on your experience
              </p>
              <Button
                type="button"
                onClick={() => router.push("/user/resume-builder")}
                className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Build Resume with AI
              </Button>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground py-2">OR</div>

          {user.resume ? (
            <Card className="border-2">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                  <Briefcase className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm font-medium mb-1">{t("profile.resumeUploaded")}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  {user.resume.split("/").pop()}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsResumeDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    {t("profile.viewResume")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("resume-upload")?.click()}
                    className="cursor-pointer"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t("profile.replaceResume")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">No Resume Uploaded (Optional)</p>
                <p className="text-xs text-muted-foreground mb-4 text-center">
                  You can upload a PDF, DOC, or DOCX file, or use the AI Resume Builder above
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("resume-upload")?.click()}
                  className="cursor-pointer"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resume (Optional)
                </Button>
              </CardContent>
            </Card>
          )}
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleResumeUpload}
          />
        </div>
      </DashboardCard>

      {/* Resume Viewer Dialog */}
      <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] w-full">
          <DialogHeader>
            <DialogTitle>{t("profile.resumePreview")}</DialogTitle>
            <DialogDescription>
              {t("profile.resumePreviewDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="relative w-full h-[70vh] border rounded-lg overflow-hidden">
              {user.resume ? (
                <iframe
                  src={user.resume}
                  className="w-full h-full"
                  title="Resume Preview"
                  style={{ border: "none" }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No resume available
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResumeDialogOpen(false)}
              >
                {t("profile.close")}
              </Button>
              {user.resume && (
                <Button
                  type="button"
                  onClick={() => {
                    if (!user.resume) return;
                    const link = document.createElement("a");
                    link.href = user.resume;
                    link.download = user.resume.split("/").pop() || "resume.pdf";
                    link.target = "_blank";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("profile.downloadResume")}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

