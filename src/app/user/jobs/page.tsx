"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardCard from "@/components/admin/DashboardCard";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";

import { Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  DollarSign,
  Bookmark,
  ArrowRight,
  Filter,
  Clock,
} from "lucide-react";

interface Job {
  _id: string;
  title: string;
  company: {
    _id: string;
    name: string;
    logo?: string;
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
  image?: string;
  createdAt: string;
}

export default function BrowseJobsPage() {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        status: "active",
      });

      if (selectedIndustry !== "All") {
        params.append("industry", selectedIndustry);
      }
      if (selectedLocation !== "All") {
        params.append("location", selectedLocation);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const data = await apiClient.get<{ jobs: Job[]; pagination: { page: number; limit: number; total: number; pages: number } }>(
        `/api/jobs?${params.toString()}`
      );
      setJobs(data.jobs);
      setTotalPages(data.pagination.pages);
    } catch (error: unknown) {
      console.error("Error fetching jobs:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load jobs";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, selectedType, selectedLocation, selectedIndustry, searchQuery, toast]);

  const toggleSaveJob = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter((id) => id !== jobId));
      toast.info("Job removed from saved");
    } else {
      setSavedJobs([...savedJobs, jobId]);
      toast.success("Job saved");
    }
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

  const formatSalary = (salary?: { min?: number; max?: number; currency?: string; period?: string }) => {
    if (!salary || (!salary.min && !salary.max)) return "Salary not specified";
    // const currency = salary.currency || "AUD"; // Removed unused variable
    const period = salary.period === "year" ? "year" : salary.period === "month" ? "month" : "hour";
    if (salary.min && salary.max) {
      return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}/${period}`;
    }
    if (salary.min) {
      return `From $${salary.min.toLocaleString()}/${period}`;
    }
    return `Up to $${salary.max?.toLocaleString()}/${period}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const filteredJobs = jobs.filter((job) => {
    if (selectedType !== "All" && job.type !== selectedType.toLowerCase().replace("-", "")) {
      return false;
    }
    return true;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedLocation("All");
    setSelectedIndustry("All");
    setPage(1);
  };

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
            <Briefcase className="h-6 w-6 text-[#B260E6]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Browse Jobs</h1>
            <p className="text-muted-foreground mt-1">
              Discover opportunities that match your skills ({loading ? "..." : filteredJobs.length} jobs)
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <DashboardCard title="Filters" description="Refine your search">
            <div className="space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Job Type */}
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => {
                    setSelectedType(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  value={selectedLocation}
                  onValueChange={(value) => {
                    setSelectedLocation(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Locations</SelectItem>
                    <SelectItem value="Sydney">Sydney</SelectItem>
                    <SelectItem value="Melbourne">Melbourne</SelectItem>
                    <SelectItem value="Brisbane">Brisbane</SelectItem>
                    <SelectItem value="Perth">Perth</SelectItem>
                    <SelectItem value="Adelaide">Adelaide</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select
                  value={selectedIndustry}
                  onValueChange={(value) => {
                    setSelectedIndustry(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Industries</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Filters */}
              <Button variant="outline" className="w-full" onClick={resetFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </DashboardCard>
        </div>

        {/* Jobs List */}
        <div className="lg:col-span-3">
          {loading ? (
            <DashboardCard title="Loading..." description="Fetching jobs">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground">Loading jobs...</p>
              </div>
            </DashboardCard>
          ) : filteredJobs.length === 0 ? (
            <DashboardCard title="No Jobs Found" description="Try adjusting your filters">
              <div className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No jobs match your criteria</p>
              </div>
            </DashboardCard>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card className="group overflow-hidden border-border bg-card/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg mb-1 group-hover:text-[#B260E6] transition-colors">
                                {job.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">{job.company.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getTypeColor(job.type)}>
                                {job.type.replace("-", " ")}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{formatSalary(job.salary)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatDate(job.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              <span>{job.industry}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className="rounded-xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] hover:scale-[1.02] transition-transform"
                              onClick={() => toast.info("Application feature coming soon")}
                            >
                              Quick Apply
                            </Button>
                            <Link href={`/user/jobs/${job._id}`}>
                              <Button variant="outline" className="rounded-xl">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={
                            savedJobs.includes(job._id)
                              ? "text-[#ED84A5] hover:text-[#ED84A5]"
                              : "text-muted-foreground hover:text-[#ED84A5]"
                          }
                          onClick={() => toggleSaveJob(job._id)}
                        >
                          <Bookmark
                            className={`h-5 w-5 ${
                              savedJobs.includes(job._id) ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredJobs.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  className={
                    page === p
                      ? "bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]"
                      : ""
                  }
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
