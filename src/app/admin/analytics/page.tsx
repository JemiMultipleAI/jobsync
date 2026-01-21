"use client";

import { useState, useEffect, useCallback } from "react";
import AnalyticsChart from "@/components/shared/AnalyticsChart";
import DashboardCard from "@/components/shared/DashboardCard";
import StatWidget from "@/components/shared/StatWidget";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { TrendingUp, 
  Users, 
  Building2, 
  BarChart3, 
} from "lucide-react"
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/useToast";

export default function AnalyticsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGrowth: 0,
    newUsers: 0,
    newJobs: 0,
    newCompanies: 0,
    activeUsers: 0,
    activeJobs: 0,
  });
  const [jobsPostedData, setJobsPostedData] = useState<{ name: string; count: number }[]>([]);
  const [userRolesData, setUserRolesData] = useState<{ name: string; value: number }[]>([]);
  const [topCompaniesData, setTopCompaniesData] = useState<{ name: string; jobs: number }[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<{ name: string; users: number }[]>([]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const [jobsRes, companiesRes, usersRes] = await Promise.all([
        apiClient.get<{ jobs: Array<{ status: string; createdAt: string; company?: { name: string; _id: string } }>; pagination: { total: number } }>("/api/jobs?limit=1000"),
        apiClient.get<{ companies: Array<{ _id: string; name: string; verified: boolean; createdAt: string }>; pagination: { total: number } }>("/api/companies?limit=1000"),
        apiClient.get<{ users: Array<{ role: string; createdAt: string }>; pagination: { total: number } }>("/api/admin/users?limit=1000"),
      ]);

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Calculate stats for last 30 days
      const newUsers = usersRes.users.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length;
      const newJobs = jobsRes.jobs.filter(j => new Date(j.createdAt) >= thirtyDaysAgo).length;
      const newCompanies = companiesRes.companies.filter(c => new Date(c.createdAt) >= thirtyDaysAgo).length;
      
      // Calculate total growth (percentage change)
      const previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const previousPeriodEnd = thirtyDaysAgo;
      const previousUsers = usersRes.users.filter(u => {
        const date = new Date(u.createdAt);
        return date >= previousPeriodStart && date < previousPeriodEnd;
      }).length;
      const totalGrowth = previousUsers > 0 ? ((newUsers - previousUsers) / previousUsers) * 100 : 0;

      // Active jobs (status === "active")
      const activeJobs = jobsRes.jobs.filter(j => j.status === "active").length;

      setStats({
        totalGrowth: Math.round(totalGrowth * 10) / 10,
        newUsers,
        newJobs,
        newCompanies,
        activeUsers: usersRes.pagination.total,
        activeJobs,
      });

      // Generate jobs posted over time (last 6 months)
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
      setJobsPostedData(monthsData);

      // User roles distribution
      const roleCounts = usersRes.users.reduce((acc, user) => {
        const role = user.role || "user";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      setUserRolesData([
        { name: "Users", value: roleCounts.user || 0 },
        { name: "Employers", value: roleCounts.employer || 0 },
        { name: "Admins", value: roleCounts.admin || 0 },
      ].filter(item => item.value > 0));

      // Top companies by job count
      const companyJobCounts = jobsRes.jobs.reduce((acc, job) => {
        if (job.company?._id) {
          const companyId = job.company._id;
          acc[companyId] = {
            name: job.company.name || "Unknown",
            count: (acc[companyId]?.count || 0) + 1,
          };
        }
        return acc;
      }, {} as Record<string, { name: string; count: number }>);

      const topCompanies = Object.values(companyJobCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(company => ({
          name: company.name,
          jobs: company.count,
        }));
      setTopCompaniesData(topCompanies);

      // User growth over time (last 6 months)
      const userGrowth = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const nextDate = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
        const monthUsers = usersRes.users.filter((user) => {
          const userDate = new Date(user.createdAt);
          return userDate >= date && userDate < nextDate;
        });
        return {
          name: date.toLocaleDateString("en-US", { month: "short" }),
          users: monthUsers.length,
        };
      });
      setUserGrowthData(userGrowth);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

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
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Comprehensive insights and metrics for your platform.
          </p>
        </div>
      </motion.div>

      {/* Overview Stats */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatWidget
            title="Total Growth"
            value={`${stats.totalGrowth >= 0 ? "+" : ""}${stats.totalGrowth.toFixed(1)}%`}
            icon={TrendingUp}
            description="This month"
            trend={{ value: stats.totalGrowth, isPositive: stats.totalGrowth >= 0 }}
          />
          <StatWidget
            title="New Users"
            value={stats.newUsers.toLocaleString()}
            icon={Users}
            description="Last 30 days"
            trend={{ value: stats.newUsers > 0 ? 100 : 0, isPositive: stats.newUsers > 0 }}
          />
          <StatWidget
            title="New Jobs"
            value={stats.newJobs.toLocaleString()}
            icon={Briefcase}
            description="Last 30 days"
            trend={{ value: stats.newJobs > 0 ? 100 : 0, isPositive: stats.newJobs > 0 }}
          />
          <StatWidget
            title="New Companies"
            value={stats.newCompanies.toLocaleString()}
            icon={Building2}
            description="Last 30 days"
            trend={{ value: stats.newCompanies > 0 ? 100 : 0, isPositive: stats.newCompanies > 0 }}
          />
        </div>
      )}

      {/* Charts Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <AnalyticsChart
              title="Jobs Posted Over Time"
              description="Monthly job posting trends"
              data={jobsPostedData}
              type="line"
              dataKey="count"
              nameKey="name"
            />
            {userRolesData.length > 0 && (
              <AnalyticsChart
                title="User Roles Distribution"
                description="Breakdown of user types"
                data={userRolesData}
                type="pie"
                dataKey="value"
                nameKey="name"
              />
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AnalyticsChart
              title="User Growth"
              description="Monthly user registration trends"
              data={userGrowthData}
              type="line"
              dataKey="users"
              nameKey="name"
            />
            {topCompaniesData.length > 0 ? (
              <AnalyticsChart
                title="Top Hiring Companies"
                description="Companies with most job postings"
                data={topCompaniesData}
                type="bar"
                dataKey="jobs"
                nameKey="name"
              />
            ) : (
              <DashboardCard title="Top Hiring Companies" description="Companies with most job postings">
                <div className="text-center py-8 text-muted-foreground">
                  No company data available
                </div>
              </DashboardCard>
            )}
          </div>
        </>
      )}

      {/* Additional Metrics */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <DashboardCard title="Total Users" description="Registered users">
            <div className="text-3xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-1">
              All registered users
            </p>
          </DashboardCard>
          <DashboardCard title="Active Jobs" description="Currently listed">
            <div className="text-3xl font-bold">{stats.activeJobs.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Jobs with active status
            </p>
          </DashboardCard>
          <DashboardCard
            title="Total Jobs"
            description="All job postings"
          >
            <div className="text-3xl font-bold">{stats.newJobs > 0 ? "See chart" : "0"}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Check chart for details
            </p>
          </DashboardCard>
        </div>
      )}
    </div>
  );
}
