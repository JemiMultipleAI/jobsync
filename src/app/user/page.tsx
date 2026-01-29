"use client";

import StatWidget from "@/components/admin/StatWidget";
import DashboardCard from "@/components/admin/DashboardCard";
import AnalyticsChart from "@/components/admin/AnalyticsChart";
import { FileText, Bookmark, UserCheck, Building2, Clock } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: {
      _id: string;
      name: string;
      logo?: string;
    };
    location: string;
    type: string;
  };
  status: string;
  appliedAt: string;
  updatedAt: string;
}

interface RecentActivityItem {
  id: string;
  action: string;
  job: string;
  company: string;
  time: string;
  status: string;
  jobId: string;
}

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
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [applicationsStatusData, setApplicationsStatusData] = useState<
    { name: string; value: number }[]
  >([]);

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  };

  // Get status display name
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pending",
      "under-review": "Under Review",
      shortlisted: "Shortlisted",
      rejected: "Rejected",
      accepted: "Accepted",
      withdrawn: "Withdrawn",
    };
    return statusMap[status] || status;
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [profileRes, applicationsRes, savedJobsRes] = await Promise.all([
        apiClient.get<{ user: UserProfile }>("/api/auth/profile"),
        apiClient.get<{ applications: Application[]; pagination: { total: number } }>("/api/applications?limit=50"),
        apiClient.get<{ savedJobs: Array<{ _id: string }> }>("/api/saved-jobs"),
      ]);

      setProfile(profileRes.user);

      const applications = applicationsRes.applications || [];
      const savedJobs = savedJobsRes.savedJobs || [];

      // Calculate stats
      const totalApplications = applicationsRes.pagination?.total || applications.length;
      const activeApplications = applications.filter(
        (app) => !["rejected", "withdrawn", "accepted"].includes(app.status)
      ).length;

      setStats({
        totalApplications,
        activeApplications,
        savedJobs: savedJobs.length,
        profileCompletion: profileRes.user.profileCompletion || 0,
      });

      // Build recent activity from applications (sorted by most recent first)
      const sortedApplications = [...applications].sort(
        (a, b) => new Date(b.updatedAt || b.appliedAt).getTime() - new Date(a.updatedAt || a.appliedAt).getTime()
      );

      const activity: RecentActivityItem[] = sortedApplications.slice(0, 10).map((app) => ({
        id: app._id,
        action: app.status === "pending" ? "Applied to" : `Status: ${getStatusDisplay(app.status)}`,
        job: app.job?.title || "Unknown Job",
        company: app.job?.company?.name || "Unknown Company",
        time: formatRelativeTime(app.updatedAt || app.appliedAt),
        status: app.status,
        jobId: app.job?._id || "",
      }));

      setRecentActivity(activity);

      // Calculate status distribution for chart
      const statusCounts: Record<string, number> = {
        Pending: 0,
        "Under Review": 0,
        Shortlisted: 0,
        Rejected: 0,
        Accepted: 0,
      };

      applications.forEach((app) => {
        const displayStatus = getStatusDisplay(app.status);
        if (displayStatus in statusCounts) {
          statusCounts[displayStatus]++;
        }
      });

      // Only include statuses with value > 0
      setApplicationsStatusData(
        Object.entries(statusCounts)
          .filter(([, value]) => value > 0)
          .map(([name, value]) => ({ name, value }))
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s an overview of your job search activity.
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
            title="Total Applications"
            value={stats.totalApplications.toString()}
            icon={FileText}
            description="All applications"
            trend={{ value: 0, isPositive: true }}
          />
          <StatWidget
            title="Active Applications"
            value={stats.activeApplications.toString()}
            icon={CheckCircle}
            description="In progress"
            trend={{ value: 0, isPositive: true }}
          />
          <StatWidget
            title="Saved Jobs"
            value={stats.savedJobs.toString()}
            icon={Bookmark}
            description="Bookmarked jobs"
            trend={{ value: 0, isPositive: true }}
          />
          <StatWidget
            title="Profile Completion"
            value={`${stats.profileCompletion}%`}
            icon={UserCheck}
            description="Profile strength"
            trend={{ value: 0, isPositive: true }}
          />
        </div>
      )}

      {/* Charts and Recent Activity Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Applications Status Distribution */}
        <div className="h-[420px]">
          {loading ? (
            <div className="h-full bg-gray-100 rounded-lg animate-pulse" />
          ) : applicationsStatusData.length === 0 ? (
            <DashboardCard
              title="Applications Status Distribution"
              description="Breakdown of your application statuses"
              className="h-full"
            >
              <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No applications yet</p>
                <p className="text-sm text-muted-foreground mt-1">Apply to jobs to see your status distribution</p>
              </div>
            </DashboardCard>
          ) : (
            <AnalyticsChart
              title="Applications Status Distribution"
              description="Breakdown of your application statuses"
              data={applicationsStatusData}
              type="pie"
              dataKey="value"
              nameKey="name"
            />
          )}
        </div>

        {/* Recent Activity */}
        <div className="h-[420px]">
          {loading ? (
            <div className="h-full bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <DashboardCard
              title="Recent Activity"
              description="Your latest job application updates"
              className="h-full"
            action={
              <Link href="/user/applications">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            }
          >
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
                <p className="text-muted-foreground">No recent activity</p>
                <p className="text-sm text-muted-foreground mt-1">Apply to jobs to see your activity here</p>
                <Link href="/user/jobs">
                  <Button variant="outline" className="mt-4">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto">
                {recentActivity.map((activity) => {
                  const statusColors: Record<string, string> = {
                    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
                    "under-review": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
                    shortlisted: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
                    rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
                    accepted: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
                    withdrawn: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
                  };

                  return (
                    <Link
                      key={activity.id}
                      href={`/user/jobs/${activity.jobId}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10 shrink-0">
                            <FileText className="h-5 w-5 text-[#B260E6]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{activity.job}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3 shrink-0" />
                              <span className="truncate">{activity.company}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <Badge className={`${statusColors[activity.status] || "bg-gray-100"} text-xs`}>
                            {getStatusDisplay(activity.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </DashboardCard>
          )}
        </div>
      </div>
    </div>
  );
}
