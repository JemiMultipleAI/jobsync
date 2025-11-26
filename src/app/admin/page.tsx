"use client";

import StatWidget from "@/components/admin/StatWidget";
import DashboardCard from "@/components/admin/DashboardCard";
import DataTable from "@/components/admin/DataTable";
import AnalyticsChart from "@/components/admin/AnalyticsChart";
import { Users, Building2, CheckCircle2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { ArrowRight } from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalUsers: 0,
    totalCompanies: 0,
    pendingApprovals: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [jobsData, setJobsData] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [jobsRes, companiesRes] = await Promise.all([
        apiClient.get<{ jobs: any[]; pagination: any }>("/api/jobs?limit=100"),
        apiClient.get<{ companies: any[]; pagination: any }>("/api/companies?limit=100"),
        // Note: We don't have a users API yet, so we'll skip it for now
      ]);

      const totalJobs = jobsRes.pagination.total || 0;
      const activeJobs = jobsRes.jobs.filter((j) => j.status === "active").length;
      const totalCompanies = companiesRes.pagination.total || 0;
      const verifiedCompanies = companiesRes.companies.filter((c) => c.verified).length;
      const pendingCompanies = companiesRes.companies.filter((c) => !c.verified).length;

      setStats({
        totalJobs: totalJobs,
        totalUsers: 0, // Would need users API
        totalCompanies: verifiedCompanies,
        pendingApprovals: pendingCompanies,
      });

      // Generate recent activity from jobs
      const activity = jobsRes.jobs
        .slice(0, 5)
        .map((job, idx) => ({
          id: idx + 1,
          action: "New job posted",
          user: job.company?.name || "Unknown",
          item: job.title,
          time: formatTimeAgo(job.createdAt),
          status: job.status,
        }));
      setRecentActivity(activity);

      // Generate jobs chart data (last 6 months)
      const now = new Date();
      const monthsData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const monthJobs = jobsRes.jobs.filter((job) => {
          const jobDate = new Date(job.createdAt);
          return (
            jobDate.getMonth() === date.getMonth() &&
            jobDate.getFullYear() === date.getFullYear()
          );
        });
        return {
          name: date.toLocaleDateString("en-US", { month: "short" }),
          count: monthJobs.length,
        };
      });
      setJobsData(monthsData);
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

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 pb-2"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10">
          <LayoutDashboard className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Welcome back! Here&apos;s what&apos;s happening with your platform.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Jobs",
              value: stats.totalJobs.toLocaleString(),
              icon: Briefcase,
              description: "Active job listings",
              trend: { value: 12.5, isPositive: true },
            },
            {
              title: "Total Users",
              value: stats.totalUsers > 0 ? stats.totalUsers.toLocaleString() : "N/A",
              icon: Users,
              description: "Registered users",
              trend: { value: 8.3, isPositive: true },
            },
            {
              title: "Active Companies",
              value: stats.totalCompanies.toLocaleString(),
              icon: Building2,
              description: "Verified companies",
              trend: { value: 5.2, isPositive: true },
            },
            {
              title: "Pending Approvals",
              value: stats.pendingApprovals.toLocaleString(),
              icon: CheckCircle2,
              description: "Awaiting review",
              trend: { value: -2.1, isPositive: false },
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <StatWidget {...stat} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <AnalyticsChart
            title="Jobs Posted Over Time"
            description="Monthly job posting trends"
            data={jobsData}
            type="line"
            dataKey="count"
            nameKey="name"
          />
        )}
        <DashboardCard
          title="Quick Actions"
          description="Common administrative tasks"
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users, label: "Manage Users", desc: "View all users", href: "/admin/users" },
              { icon: Briefcase, label: "Manage Jobs", desc: "View all jobs", href: "/admin/jobs" },
              {
                icon: Building2,
                label: "Manage Companies",
                desc: "View all companies",
                href: "/admin/companies",
              },
              {
                icon: CheckCircle2,
                label: "Pending Reviews",
                desc: `${stats.pendingApprovals} items`,
                href: "/admin/companies",
              },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Link href={action.href}>
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
                </motion.div>
              );
            })}
          </div>
        </DashboardCard>
      </div>

      {/* Recent Activity */}
      <DashboardCard
        title="Recent Activity"
        description="Latest actions and updates"
        action={
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        }
      >
        {loading ? (
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
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
                key: "user",
                label: "User",
              },
              {
                key: "item",
                label: "Item",
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
