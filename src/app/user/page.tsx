"use client";

import StatWidget from "@/components/admin/StatWidget";
import DashboardCard from "@/components/admin/DashboardCard";
import DataTable from "@/components/admin/DataTable";
import AnalyticsChart from "@/components/admin/AnalyticsChart";
import { FileText, Bookmark, UserCheck, Building2 } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function UserDashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeApplications: 0,
    savedJobs: 0,
    profileCompletion: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [applicationsStatusData, setApplicationsStatusData] = useState<
    { name: string; value: number }[]
  >([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const profileRes = await apiClient.get<{ user: any }>("/api/auth/profile");
      setProfile(profileRes.user);

      // Note: Applications API doesn't exist yet, so we'll use mock data structure
      // In the future, replace with: const appsRes = await apiClient.get("/api/applications");
      
      setStats({
        totalApplications: 0, // Would come from applications API
        activeApplications: 0, // Would come from applications API
        savedJobs: 0, // Would come from saved jobs API
        profileCompletion: profileRes.user.profileCompletion || 0,
      });

      // Mock recent activity - in future, fetch from applications API
      setRecentActivity([]);
      setApplicationsStatusData([
        { name: "Pending", value: 0 },
        { name: "Under Review", value: 0 },
        { name: "Shortlisted", value: 0 },
        { name: "Rejected", value: 0 },
        { name: "Accepted", value: 0 },
      ]);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
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

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
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
        {loading ? (
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <DashboardCard
            title="Quick Actions"
            description="Common tasks"
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: FileText,
                  label: "Browse Jobs",
                  desc: "Find opportunities",
                  href: "/user/jobs",
                },
                {
                  icon: Building2,
                  label: "View Companies",
                  desc: "Explore employers",
                  href: "/user/companies",
                },
                {
                  icon: UserCheck,
                  label: "Update Profile",
                  desc: "Complete your profile",
                  href: "/user/profile",
                },
                {
                  icon: Bookmark,
                  label: "Saved Jobs",
                  desc: "View saved positions",
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
        title="Recent Activity"
        description="Your latest job search actions"
        action={
          <Link href="/user/applications">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        }
      >
        {loading ? (
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        ) : recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent activity</p>
            <Link href="/user/jobs">
              <Button variant="outline" className="mt-4">
                Browse Jobs
              </Button>
            </Link>
          </div>
        ) : (
          <DataTable
            data={recentActivity}
            columns={[
              {
                key: "action",
                label: "Action",
                render: (value) => (
                  <span className="font-medium">{String(value)}</span>
                ),
              },
              {
                key: "job",
                label: "Job",
              },
              {
                key: "company",
                label: "Company",
              },
              {
                key: "time",
                label: "Time",
              },
              {
                key: "status",
                label: "Status",
                render: (value) => {
                  const variants = {
                    active: "default",
                    pending: "secondary",
                    completed: "outline",
                    saved: "secondary",
                  } as const;
                  return (
                    <Badge variant={variants[value as keyof typeof variants] || "outline"}>
                      {String(value)}
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
