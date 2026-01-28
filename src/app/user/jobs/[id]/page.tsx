"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import DashboardCard from "@/components/admin/DashboardCard";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Building2,
  Bookmark,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";

interface Job {
  _id: string;
  title: string;
  description: string;
  requirements?: string[];
  company: {
    _id: string;
    name: string;
    logo?: string;
    industry?: string;
    location?: string;
    description?: string;
    website?: string;
  };
  location: string;
  type: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  industry: string;
  experienceLevel?: string;
  status: string;
  image?: string;
  createdAt: string;
  postedBy?: {
    name: string;
    email: string;
  };
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [applying, setApplying] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ job: Job }>(`/api/jobs/${params.id}`);
      setJob(response.job);
    } catch (error) {
      console.error("Error fetching job:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load job details";
      toast.error(errorMessage);
      router.push("/user/jobs");
    } finally {
      setLoading(false);
    }
  }, [params.id, router, toast]);

  const checkIfSaved = useCallback(async () => {
    try {
      const response = await apiClient.get<{ savedJobs: Array<{ job: { _id: string } }> }>("/api/saved-jobs");
      const savedJobIds = response.savedJobs.map((sj) => sj.job._id);
      setIsSaved(savedJobIds.includes(params.id as string));
    } catch (_error) {
      // Silently fail - user might not be logged in
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchJob();
      checkIfSaved();
    }
  }, [params.id, fetchJob, checkIfSaved]);

  const handleSaveJob = async () => {
    try {
      if (isSaved) {
        await apiClient.delete(`/api/saved-jobs?jobId=${params.id}`);
        setIsSaved(false);
        toast.success("Job removed from saved");
      } else {
        await apiClient.post("/api/saved-jobs", { job: params.id });
        setIsSaved(true);
        toast.success("Job saved successfully");
      }
    } catch (error) {
      console.error("Error saving job:", error);
      const message = error instanceof Error ? error.message : "Failed to save job";
      toast.error(message);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      await apiClient.post("/api/applications", { job: params.id });
      toast.success("Application submitted successfully!");
      router.push("/user/applications");
    } catch (error) {
      console.error("Error applying:", error);
      const errorMessage = error instanceof Error ? error.message : "";
      if (errorMessage.includes("already applied")) {
        toast.error("You have already applied to this job");
      } else {
        const message = error instanceof Error ? error.message : "Failed to submit application";
        toast.error(message);
      }
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (salary?: { min?: number; max?: number; currency?: string; period?: string }) => {
    if (!salary || (!salary.min && !salary.max)) return "Not specified";
    const currency = salary.currency || "AUD";
    const period = salary.period === "year" ? "year" : salary.period === "month" ? "month" : "hour";
    if (salary.min && salary.max) {
      return `${currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}/${period}`;
    }
    if (salary.min) return `From ${currency} ${salary.min.toLocaleString()}/${period}`;
    if (salary.max) return `Up to ${currency} ${salary.max.toLocaleString()}/${period}`;
    return "Not specified";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "full-time": "bg-green-500/10 text-green-700 dark:text-green-400",
      "part-time": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      contract: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
      temporary: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    };
    return colors[type] || "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Job not found</p>
        <Button onClick={() => router.push("/user/jobs")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Job Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{job.title}</h1>
                  <Badge className={getTypeColor(job.type)}>
                    {job.type.replace("-", " ")}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{job.company.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Posted {formatDate(job.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveJob}
                  className={isSaved ? "text-[#ED84A5]" : ""}
                >
                  <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={applying || job.status !== "active"}
                  className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]"
                >
                  {applying ? "Applying..." : "Apply Now"}
                </Button>
              </div>
            </div>

            {/* Job Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Salary</p>
                <p className="font-medium flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatSalary(job.salary)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Industry</p>
                <p className="font-medium flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {job.industry}
                </p>
              </div>
              {job.experienceLevel && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Experience</p>
                  <p className="font-medium capitalize">{job.experienceLevel}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant={job.status === "active" ? "default" : "secondary"}>
                  {job.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <DashboardCard title="Job Description" description="About this position">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-muted-foreground">
                {job.description}
              </p>
            </div>
          </DashboardCard>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <DashboardCard title="Requirements" description="What we're looking for">
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </DashboardCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          <DashboardCard title="Company" description="About the employer">
            <div className="space-y-4">
              {job.company.logo && (
                <div className="relative h-20 w-20 rounded-lg overflow-hidden">
                  <Image
                    src={job.company.logo}
                    alt={job.company.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg mb-1">{job.company.name}</h3>
                {job.company.industry && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {job.company.industry}
                  </p>
                )}
                {job.company.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.company.location}
                  </p>
                )}
              </div>
              {job.company.description && (
                <p className="text-sm text-muted-foreground">
                  {job.company.description}
                </p>
              )}
              {job.company.website && (
                <Link href={job.company.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    Visit Website
                  </Button>
                </Link>
              )}
              <Link href={`/user/companies/${job.company._id}`}>
                <Button variant="outline" className="w-full">
                  View Company Profile
                </Button>
              </Link>
            </div>
          </DashboardCard>

          {/* Quick Actions */}
          <DashboardCard title="Quick Actions" description="Manage this job">
            <div className="space-y-2">
              <Button
                onClick={handleApply}
                disabled={applying || job.status !== "active"}
                className="w-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]"
              >
                {applying ? "Applying..." : "Apply Now"}
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveJob}
                className={`w-full ${isSaved ? "text-[#ED84A5]" : ""}`}
              >
                <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Remove from Saved" : "Save Job"}
              </Button>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

