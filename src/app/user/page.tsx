"use client";

import StatWidget from "@/components/shared/StatWidget";
import DashboardCard from "@/components/shared/DashboardCard";
import DataTable from "@/components/shared/DataTable";
import AnalyticsChart from "@/components/shared/AnalyticsChart";
import { FileText, Bookmark, UserCheck, Building2 } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
// Fallback translation function
const t = (key: string) => {
  const translations: Record<string, string> = {
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome back! Here's your overview.",
    "dashboard.totalApplications": "Total Applications",
    "dashboard.totalApplicationsDesc": "All your job applications",
    "dashboard.activeApplications": "Active Applications",
    "dashboard.activeApplicationsDesc": "Currently under review",
    "dashboard.savedJobs": "Saved Jobs",
    "dashboard.savedJobsDesc": "Jobs you've bookmarked",
    "dashboard.profileCompletion": "Profile Completion",
    "dashboard.profileCompletionDesc": "Complete your profile",
    "dashboard.applicationsStatus": "Application Status",
    "dashboard.applicationsStatusDesc": "Overview of your application statuses",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.quickActionsDesc": "Common tasks and shortcuts",
    "dashboard.browseJobs": "Browse Jobs",
    "dashboard.browseJobsDesc": "Search for opportunities",
    "dashboard.viewCompanies": "View Companies",
    "dashboard.viewCompaniesDesc": "Explore employers",
    "dashboard.updateProfile": "Update Profile",
    "dashboard.updateProfileDesc": "Keep your profile current",
    "dashboard.savedJobsLink": "Saved Jobs",
    "dashboard.savedJobsLinkDesc": "View bookmarked positions",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.recentActivityDesc": "Your latest job application activity",
    "dashboard.viewAll": "View All",
    "dashboard.noRecentActivity": "No recent activity. Start applying to jobs!",
    "dashboard.action": "Action",
    "dashboard.job": "Job",
    "dashboard.company": "Company",
    "dashboard.time": "Time",
    "dashboard.status": "Status",
  };
  return translations[key] || key;
};

export default function UserDashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  interface UserProfile {
    _id: string;
    name: string;
    email: string;
    profileCompletion: number;
  }
  const [_profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeApplications: 0,
    savedJobs: 0,
    profileCompletion: 0,
  });
  interface RecentActivity {
    type: string;
    title: string;
    date: string;
  }
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [applicationsStatusData, setApplicationsStatusData] = useState<
    { name: string; value: number }[]
  >([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      interface UserProfile {
        _id: string;
        name: string;
        email: string;
        profileCompletion: number;
      }
      const profileRes = await apiClient.get<{ user: UserProfile }>("/api/auth/profile");
      
      if (!profileRes || !profileRes.user) {
        throw new Error("Invalid response from server");
      }
      
      setProfile(profileRes.user);

      // Fetch applications
      const appsRes = await apiClient.get<{
        applications: Array<{ status: string }>;
        pagination: { total: number };
      }>("/api/applications?limit=100");
      
      const applications = appsRes.applications || [];
      const totalApplications = appsRes.pagination?.total || applications.length;
      const activeApplications = applications.filter(
        (app) => app.status === "pending" || app.status === "under-review" || app.status === "shortlisted"
      ).length;

      // Fetch saved jobs
      const savedJobsRes = await apiClient.get<{
        savedJobs: unknown[];
        pagination: { total: number };
      }>("/api/saved-jobs?limit=100");
      
      const savedJobsCount = savedJobsRes.pagination?.total || (savedJobsRes.savedJobs?.length || 0);
      
      setStats({
        totalApplications,
        activeApplications,
        savedJobs: savedJobsCount,
        profileCompletion: profileRes.user.profileCompletion || 0,
      });

      // Process applications for chart data - only include statuses with applications
      const statusCounts: Record<string, number> = {};
      applications.forEach((app: any) => {
        const status = app.status || "pending";
        const displayStatus = status
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        statusCounts[displayStatus] = (statusCounts[displayStatus] || 0) + 1;
      });

      // Only include statuses that have at least 1 application
      const chartData = Object.entries(statusCounts)
        .filter(([_, count]) => count > 0)
        .map(([name, value]) => ({ name, value }));
      
      setApplicationsStatusData(chartData);

      // Create recent activity from applications with proper structure
      const activity = applications.slice(0, 5).map((app: any) => ({
        action: t("dashboard.applied"),
        job: app.job?.title || "Unknown Job",
        company: app.job?.company?.name || "Unknown Company",
        time: new Date(app.appliedAt || app.createdAt).toLocaleDateString(),
        status: app.status || "pending",
      }));
      setRecentActivity(activity);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load dashboard data";
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("Authentication")) {
        // Redirect handled by middleware or component
        toast.error("Please log in again");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("dashboard.welcome")}
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
            title={t("dashboard.totalApplications")}
            value={stats.totalApplications.toString()}
            icon={FileText}
            description={t("dashboard.totalApplicationsDesc")}
            trend={{ value: 0, isPositive: true }}
          />
          <StatWidget
            title={t("dashboard.activeApplications")}
            value={stats.activeApplications.toString()}
            icon={CheckCircle}
            description={t("dashboard.activeApplicationsDesc")}
            trend={{ value: 0, isPositive: true }}
          />
          <StatWidget
            title={t("dashboard.savedJobs")}
            value={stats.savedJobs.toString()}
            icon={Bookmark}
            description={t("dashboard.savedJobsDesc")}
            trend={{ value: 0, isPositive: true }}
          />
          <StatWidget
            title={t("dashboard.profileCompletion")}
            value={`${stats.profileCompletion}%`}
            icon={UserCheck}
            description={t("dashboard.profileCompletionDesc")}
            trend={{ value: 0, isPositive: true }}
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <AnalyticsChart
            title={t("dashboard.applicationsStatus")}
            description={t("dashboard.applicationsStatusDesc")}
            data={applicationsStatusData}
            type="pie"
            dataKey="value"
            nameKey="name"
          />
        )}
        {loading ? (
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <DashboardCard
            title={t("dashboard.quickActions")}
            description={t("dashboard.quickActionsDesc")}
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: FileText,
                  label: t("dashboard.browseJobs"),
                  desc: t("dashboard.browseJobsDesc"),
                  href: "/user/jobs",
                },
                {
                  icon: Building2,
                  label: t("dashboard.viewCompanies"),
                  desc: t("dashboard.viewCompaniesDesc"),
                  href: "/user/companies",
                },
                {
                  icon: UserCheck,
                  label: t("dashboard.updateProfile"),
                  desc: t("dashboard.updateProfileDesc"),
                  href: "/user/profile",
                },
                {
                  icon: Bookmark,
                  label: t("dashboard.savedJobsLink"),
                  desc: t("dashboard.savedJobsLinkDesc"),
                  href: "/user/saved-jobs",
                },
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}>
                    <Button
                      variant="outline"
                      className="h-auto w-full flex-col items-start p-4 rounded-xl transition-transform duration-200 hover:scale-[1.02] hover:shadow-md"
                    >
                      <Icon className="mb-2 h-5 w-5 text-primary" />
                      <span className="font-medium">{action.label}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {action.desc}
                      </span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </DashboardCard>
        )}
      </div>

      {/* Recent Activity */}
      <DashboardCard
        title={t("dashboard.recentActivity")}
        description={t("dashboard.recentActivityDesc")}
        action={
          <Link href="/user/applications">
            <Button variant="ghost" size="sm">
              {t("dashboard.viewAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        }
      >
        {loading ? (
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        ) : recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("dashboard.noRecentActivity")}</p>
            <Link href="/user/jobs">
              <Button variant="outline" className="mt-4">
                {t("dashboard.browseJobs")}
              </Button>
            </Link>
          </div>
        ) : (
          <DataTable
            data={recentActivity as unknown as Record<string, unknown>[]}
            columns={[
              {
                key: "action",
                label: t("dashboard.action"),
                render: (value) => (
                  <span className="font-medium">{String(value)}</span>
                ),
              },
              {
                key: "job",
                label: t("dashboard.job"),
              },
              {
                key: "company",
                label: t("dashboard.company"),
              },
              {
                key: "time",
                label: t("dashboard.time"),
              },
              {
                key: "status",
                label: t("dashboard.status"),
                render: (value) => {
                  const status = String(value);
                  const displayStatus = status
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
                  const variants = {
                    pending: "secondary",
                    "under-review": "default",
                    shortlisted: "default",
                    rejected: "destructive",
                    accepted: "default",
                  } as const;
                  return (
                    <Badge variant={variants[status as keyof typeof variants] || "outline"}>
                      {displayStatus}
                    </Badge>
                  );
                },
              },
            ]}
            searchable={false}
            actions={false}
          />
        )}
      </DashboardCard>
    </div>
  );
}
