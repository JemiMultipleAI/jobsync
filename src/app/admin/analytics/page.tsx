"use client";

import AnalyticsChart from "@/components/admin/AnalyticsChart";
import DashboardCard from "@/components/admin/DashboardCard";
import StatWidget from "@/components/admin/StatWidget";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { TrendingUp, 
  Users, 
  Building2, 
  BarChart3, 
 } from "lucide-react"


// Mock data for charts
const jobsPostedData = [
  { name: "Jan", count: 125 },
  { name: "Feb", count: 152 },
  { name: "Mar", count: 148 },
  { name: "Apr", count: 161 },
  { name: "May", count: 155 },
  { name: "Jun", count: 167 },
];

const userRolesData = [
  { name: "Users", value: 6845 },
  { name: "Employers", value: 234 },
  { name: "Admins", value: 12 },
];

const topCompaniesData = [
  { name: "TechCorp", jobs: 45 },
  { name: "StartupXYZ", jobs: 32 },
  { name: "InnovateCo", jobs: 67 },
  { name: "DesignStudio", jobs: 18 },
  { name: "DataLab", jobs: 29 },
];

const userGrowthData = [
  { name: "Jan", users: 1200 },
  { name: "Feb", users: 1450 },
  { name: "Mar", users: 1680 },
  { name: "Apr", users: 1920 },
  { name: "May", users: 2150 },
  { name: "Jun", users: 2450 },
];

export default function AnalyticsPage() {
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatWidget
          title="Total Growth"
          value="+24.5%"
          icon={TrendingUp}
          description="This month"
          trend={{ value: 24.5, isPositive: true }}
        />
        <StatWidget
          title="New Users"
          value="1,234"
          icon={Users}
          description="Last 30 days"
          trend={{ value: 18.2, isPositive: true }}
        />
        <StatWidget
          title="New Jobs"
          value="567"
          icon={Briefcase}
          description="Last 30 days"
          trend={{ value: 12.8, isPositive: true }}
        />
        <StatWidget
          title="New Companies"
          value="89"
          icon={Building2}
          description="Last 30 days"
          trend={{ value: 9.5, isPositive: true }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnalyticsChart
          title="Jobs Posted Over Time"
          description="Monthly job posting trends"
          data={jobsPostedData}
          type="line"
          dataKey="count"
          nameKey="name"
        />
        <AnalyticsChart
          title="User Roles Distribution"
          description="Breakdown of user types"
          data={userRolesData}
          type="pie"
          dataKey="value"
          nameKey="name"
        />
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
        <AnalyticsChart
          title="Top Hiring Companies"
          description="Companies with most job postings"
          data={topCompaniesData}
          type="bar"
          dataKey="jobs"
          nameKey="name"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Active Users" description="Currently online">
          <div className="text-3xl font-bold">2,345</div>
          <p className="text-sm text-muted-foreground mt-1">
            +12% from last week
          </p>
        </DashboardCard>
        <DashboardCard title="Active Jobs" description="Currently listed">
          <div className="text-3xl font-bold">1,234</div>
          <p className="text-sm text-muted-foreground mt-1">
            +8% from last week
          </p>
        </DashboardCard>
        <DashboardCard
          title="Response Rate"
          description="Average response time"
        >
          <div className="text-3xl font-bold">4.2h</div>
          <p className="text-sm text-muted-foreground mt-1">
            -15% from last week
          </p>
        </DashboardCard>
      </div>
    </div>
  );
}
