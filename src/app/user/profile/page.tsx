"use client";

import { useState, useEffect, useCallback } from "react"
import DashboardCard from "@/components/admin/DashboardCard";
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
  Trash2,
  FileText,
  Plus,
} from "lucide-react"
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";


export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  interface Certificate {
    name: string;
    url: string;
    uploadedAt: string;
  }
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
    certificates?: Certificate[];
    profileCompletion: number;
  }
  const [user, setUser] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [_mounted, setMounted] = useState(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [certificateName, setCertificateName] = useState("");
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phone: "",
    location: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      // Fetch both profile and certificates in parallel
      const [profileData, certificatesData] = await Promise.all([
        apiClient.get<{ user: UserProfile }>("/api/auth/profile"),
        apiClient.get<{ certificates: Certificate[]; profileCompletion: number }>("/api/auth/upload/certificate"),
      ]);
      
      // Debug logging
      console.log("[DEBUG] Profile data:", profileData);
      console.log("[DEBUG] Certificates data:", certificatesData);
      console.log("[DEBUG] Certificates array:", certificatesData.certificates);
      
      // Merge certificates into user data
      const userWithCertificates = {
        ...profileData.user,
        certificates: certificatesData.certificates || [],
        profileCompletion: certificatesData.profileCompletion ?? profileData.user.profileCompletion,
      };
      
      console.log("[DEBUG] Merged user with certificates:", userWithCertificates);
      
      setUser(userWithCertificates);
      setFormData({
        name: profileData.user.name || "",
        bio: profileData.user.bio || "",
        phone: profileData.user.phone || "",
        location: profileData.user.location || "",
      });
      setSkills(profileData.user.skills || []);
    } catch (error) {
      console.error("Error fetching profile:", error);
      const errorMessage = error instanceof Error ? error.message : "";
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        router.push("/auth/login");
        return;
      }
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

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

  // Calculate profile completion based on local state for real-time updates
  const calculateLocalProfileCompletion = () => {
    let completion = 0;

    // 1. Profile Picture (17%)
    if (user?.profileImage && user.profileImage.trim().length > 0) {
      completion += 17;
    }

    // 2. Personal Information - name, phone, and location (17%)
    const hasName = formData.name && formData.name.trim().length > 0;
    const hasPhone = formData.phone && formData.phone.trim().length > 0;
    const hasLocation = formData.location && formData.location.trim().length > 0;
    if (hasName && hasPhone && hasLocation) {
      completion += 17;
    }

    // 3. Professional Summary - bio (16%)
    if (formData.bio && formData.bio.trim().length > 0) {
      completion += 16;
    }

    // 4. Skills (17%)
    if (skills.length > 0) {
      completion += 17;
    }

    // 5. Resume/CV (17%)
    if (user?.resume && user.resume.trim().length > 0) {
      completion += 17;
    }

    // 6. Certificates/Licences (16%)
    if (user?.certificates && user.certificates.length > 0) {
      completion += 16;
    }

    return Math.min(100, Math.max(0, completion));
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

      const data = await apiClient.put<{ message?: string; user: UserProfile }>("/api/auth/profile", updateData);

      if (data.user) {
        setUser(data.user);
        setFormData({
          name: data.user.name || "",
          bio: data.user.bio || "",
          phone: data.user.phone || "",
          location: data.user.location || "",
        });
        setSkills(data.user.skills || []);
        toast.success("Profile updated successfully!");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      if (error instanceof Error && (error.message.includes("Validation error") || (error as { details?: unknown }).details)) {
        const errorWithDetails = error as { details?: Array<{ path: string[]; message: string }>; message: string };
        const details = errorWithDetails.details || [];
        const errorMessages = details.map((d) => `${d.path.join(".")}: ${d.message}`).join(", ");
        toast.error(`Validation error: ${errorMessages || errorWithDetails.message}`);
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
        toast.error(errorMessage);
      }
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
      toast.success("Profile image uploaded successfully!");
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
      toast.success("Resume uploaded successfully!");
    } catch (error) {
      console.error("Error uploading resume:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload resume";
      toast.error(errorMessage);
    }
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!certificateName.trim()) {
      toast.error("Please enter a certificate name first");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a PDF, DOC, DOCX, JPG, or PNG file");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploadingCertificate(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", certificateName.trim());

    try {
      await apiClient.upload<{ 
        certificates: Certificate[]; 
        profileCompletion: number 
      }>("/api/auth/upload/certificate", formData);

      // Refetch profile to get the latest data
      await fetchProfile();
      setCertificateName("");
      toast.success("Certificate uploaded successfully!");
    } catch (error) {
      console.error("Error uploading certificate:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload certificate";
      toast.error(errorMessage);
    } finally {
      setUploadingCertificate(false);
      // Reset the file input
      const input = document.getElementById("certificate-upload") as HTMLInputElement;
      if (input) input.value = "";
    }
  };

  const handleDeleteCertificate = async (certificateUrl: string) => {
    try {
      await apiClient.delete<{ 
        certificates: Certificate[]; 
        profileCompletion: number 
      }>(`/api/auth/upload/certificate?url=${encodeURIComponent(certificateUrl)}`);

      // Refetch profile to get the latest data
      await fetchProfile();
      toast.success("Certificate deleted successfully!");
    } catch (error) {
      console.error("Error deleting certificate:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete certificate";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your personal information and professional profile.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profile Completion */}
      <DashboardCard title="Profile Completion" description="Complete your profile to increase your visibility">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{calculateLocalProfileCompletion()}%</span>
          </div>
          <Progress value={calculateLocalProfileCompletion()} className="h-2" />
        </div>
      </DashboardCard>

      {/* Profile Picture */}
      <DashboardCard title="Profile Picture" description="Upload a professional profile photo">
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
              Upload Photo
            </Button>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or WebP. Max size of 2MB.
            </p>
          </div>
        </div>
      </DashboardCard>

      {/* Personal Information */}
      <DashboardCard title="Personal Information" description="Update your personal details">
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
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
                Email
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
                Phone Number
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
              Location
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
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DashboardCard>

      {/* Bio/Summary */}
      <DashboardCard title="Professional Summary" description="Tell employers about yourself">
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Write a brief summary about your professional experience and career goals..."
              className="min-h-32"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {500 - (formData.bio?.length || 0)} characters remaining
            </p>
          </div>
          <Button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className="ml-auto bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Bio"}
          </Button>
        </div>
      </DashboardCard>

      {/* Skills */}
      <DashboardCard title="Skills" description="Add your technical and professional skills">
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
              placeholder="Add a skill..."
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
              Add
            </Button>
          </div>
        </div>
      </DashboardCard>

      {/* Resume/CV */}
      <DashboardCard title="Resume/CV" description="Upload your resume or CV">
        <div className="space-y-4">
          {user.resume ? (
            <Card className="border-2">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                  <Briefcase className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm font-medium mb-1">Resume uploaded</p>
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
                    View Resume
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("resume-upload")?.click()}
                    className="cursor-pointer"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Replace Resume
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
                <p className="text-sm font-medium mb-1">No resume uploaded</p>
                <p className="text-xs text-muted-foreground mb-4">
                  PDF, DOC, DOCX. Max size of 5MB.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("resume-upload")?.click()}
                  className="cursor-pointer"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resume
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

      {/* Certificates/Licences */}
      <DashboardCard title="Certificates & Licences" description="Upload your certificates, licences, and qualifications">
        <div className="space-y-4">
          {/* Upload new certificate */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Certificate name (e.g., First Aid Certificate, RSA Licence)"
                value={certificateName}
                onChange={(e) => setCertificateName(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("certificate-upload")?.click()}
              disabled={!certificateName.trim() || uploadingCertificate}
              className="cursor-pointer"
            >
              {uploadingCertificate ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Certificate
                </>
              )}
            </Button>
            <input
              id="certificate-upload"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
              className="hidden"
              onChange={handleCertificateUpload}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, DOC, DOCX, JPG, PNG. Max size: 10MB.
          </p>

          {/* List of certificates */}
          {user.certificates && user.certificates.length > 0 ? (
            <div className="space-y-3">
              {user.certificates.map((cert, index) => (
                <Card key={index} className="border">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10">
                        <Award className="h-5 w-5 text-[#B260E6]" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(cert.uploadedAt).toLocaleDateString("en-AU")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(cert.url, "_blank")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCertificate(cert.url)}
                        className="text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Award className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">No certificates uploaded</p>
                <p className="text-xs text-muted-foreground text-center">
                  Add certificates, licences, or qualifications to boost your profile
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardCard>

      {/* Resume Viewer Dialog */}
      <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] w-full">
          <DialogHeader>
            <DialogTitle>Resume Preview</DialogTitle>
            <DialogDescription>
              View your uploaded resume. You can download it using the button below.
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
                Close
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
                  Download Resume
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

