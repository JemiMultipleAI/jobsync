"use client";

import StatWidget from "@/components/admin/StatWidget";
import DashboardCard from "@/components/admin/DashboardCard";
import { Briefcase, FileText, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function EmployerDashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's company first
      const profileRes = await apiClient.get<{ user: any }>("/api/auth/profile");
      const userId = profileRes.user._id;

      // Fetch jobs posted by this employer (filtered by company or user)
      const jobsRes = await apiClient.get<{ jobs: any[]; pagination: any }>("/api/jobs?limit=100");
      
      // Filter jobs by the employer's company (assuming company is linked to user)
      // For now, we'll show all jobs - in production, filter by company
      const allJobs = jobsRes.jobs || [];
      const activeJobs = allJobs.filter((j) => j.status === "active");
      
      // Fetch applications (filtered by employer's jobs)
      let applications: any[] = [];
      try {
        const appsRes = await apiClient.get<{ applications: any[]; pagination: any }>("/api/applications?limit=100");
        applications = appsRes.applications || [];
        
        // Filter applications for jobs posted by this employer
        const employerJobIds = allJobs.map((j: any) => j._id);
        applications = applications.filter((app: any) => 
          employerJobIds.includes(app.job?._id || app.job)
        );
      } catch (error) {
        console.log("Applications API not available or no applications yet");
      }

      const pendingApplications = applications.filter((app: any) => 
        app.status === "pending" || app.status === "under_review"
      );

      setStats({
        totalJobs: allJobs.length,
        activeJobs: activeJobs.length,
        totalApplications: applications.length,
        pendingApplications: pendingApplications.length,
      });

      // Recent applications (last 5)
      setRecentApplications(
        applications
          .slice(0, 5)
          .map((app) => ({
            id: app._id,
            candidate: app.user?.name || "Unknown",
            job: app.job?.title || "Unknown Job",
            status: app.status,
            date: formatTimeAgo(app.createdAt),
          }))
      );

      // Recent jobs (last 5)
      setRecentJobs(
        allJobs
          .slice(0, 5)
          .map((job) => ({
            id: job._id,
            title: job.title,
            applications: applications.filter((app: any) => 
              app.job?._id === job._id || app.job === job._id
            ).length,
            status: job.status,
            date: formatTimeAgo(job.createdAt),
          }))
      );
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
      under_review: { label: "Under Review", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
      shortlisted: { label: "Shortlisted", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
      rejected: { label: "Rejected", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
      accepted: { label: "Accepted", className: "bg-green-600/10 text-green-800 dark:text-green-500" },
      active: { label: "Active", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
      inactive: { label: "Inactive", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
    };
    const variant = variants[status] || { label: status, className: "bg-gray-500/10 text-gray-700" };
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Employer Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your job postings and track applications.
        </p>
      </motion.div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatWidget
            title="Total Jobs"
            value={stats.totalJobs.toString()}
            icon={Briefcase}
            description="All job postings"
            trend={{ value: 0, isPositive: true }}
          />
          <StatWidget
            title="Active Jobs"
            value={stats.activeJobs.toString()}
            icon={TrendingUp}
            description="Currently active"
            trend={{ value: 0, isPositive: true }}
          />
          <StatWidget
            title="Total Applications"
            value={stats.totalApplications.toString()}
            icon={FileText}
            description="All applications"
            trend={{ value: 0, isPositive: true }}
          />
          <StatWidget
            title="Pending Reviews"
            value={stats.pendingApplications.toString()}
            icon={Users}
            description="Awaiting action"
            trend={{ value: 0, isPositive: true }}
          />
        </div>
      )}

      {/* Content Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Applications */}
        {loading ? (
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <DashboardCard
            title="Recent Applications"
            description="Latest job applications"
            action={
              <Link href="/employer/applications">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            }
          >
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No applications yet</p>
                <p className="text-sm mt-1">Applications will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{app.candidate}</p>
                      <p className="text-sm text-muted-foreground truncate">{app.job}</p>
                      <p className="text-xs text-muted-foreground mt-1">{app.date}</p>
                    </div>
                    <div className="ml-4">{getStatusBadge(app.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        )}

        {/* Recent Jobs */}
        {loading ? (
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <DashboardCard
            title="Recent Jobs"
            description="Your latest job postings"
            action={
              <Link href="/employer/jobs">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            }
          >
            {recentJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No jobs posted yet</p>
                <Link href="/employer/jobs">
                  <Button className="mt-4" size="sm">
                    Post Your First Job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.applications} application{job.applications !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{job.date}</p>
                    </div>
                    <div className="ml-4">{getStatusBadge(job.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        )}
      </div>

      {/* Quick Actions */}
      <DashboardCard
        title="Quick Actions"
        description="Common tasks"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/employer/jobs">
            <Button variant="outline" className="w-full h-auto flex-col py-4 gap-2">
              <Briefcase className="h-5 w-5" />
              <span className="text-sm">Post Job</span>
            </Button>
          </Link>
          <Link href="/employer/applications">
            <Button variant="outline" className="w-full h-auto flex-col py-4 gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm">View Applications</span>
            </Button>
          </Link>
          <Link href="/employer/candidates">
            <Button variant="outline" className="w-full h-auto flex-col py-4 gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm">Browse Candidates</span>
            </Button>
          </Link>
          <Link href="/employer/company">
            <Button variant="outline" className="w-full h-auto flex-col py-4 gap-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">Company Profile</span>
            </Button>
          </Link>
        </div>
      </DashboardCard>
    </div>
  );
}

