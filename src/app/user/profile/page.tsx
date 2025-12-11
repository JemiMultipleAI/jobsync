"use client";

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";


export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    setMounted(true);
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiClient.get<{ user: any }>("/api/auth/profile");
      setUser(data.user);
      setFormData({
        name: data.user.name || "",
        bio: data.user.bio || "",
        phone: data.user.phone || "",
        location: data.user.location || "",
      });
      setSkills(data.user.skills || []);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
        router.push("/auth/login");
        return;
      }
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

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
      const updateData: any = {};

      if (formData.name) updateData.name = formData.name;
      if (formData.bio !== undefined) updateData.bio = formData.bio;
      if (formData.phone) updateData.phone = formData.phone;
      if (formData.location) updateData.location = formData.location;
      if (skills) updateData.skills = skills;

      const data = await apiClient.put<{ message?: string; user: any }>("/api/auth/profile", updateData);

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
    } catch (error: any) {
      if (error.message?.includes("Validation error") || error.details) {
        const details = error.details || [];
        const errorMessages = details.map((d: any) => `${d.path.join(".")}: ${d.message}`).join(", ");
        toast.error(`Validation error: ${errorMessages || error.message}`);
      } else {
        toast.error(error.message || "Failed to update profile");
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

      setUser({ ...user, profileImage: data.profileImage, profileCompletion: data.profileCompletion });
      toast.success("Profile image uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
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

      setUser({ ...user, resume: data.resume, profileCompletion: data.profileCompletion });
      toast.success("Resume uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading resume:", error);
      toast.error(error.message || "Failed to upload resume");
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
            <span className="font-semibold">{user.profileCompletion || 0}%</span>
          </div>
          <Progress value={user.profileCompletion || 0} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Add your resume, complete your bio, and add skills to improve your profile.
          </p>
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

