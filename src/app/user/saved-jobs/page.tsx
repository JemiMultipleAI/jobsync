"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/admin/DashboardCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import {
  Bookmark,
  Search,
  Grid3x3,
  List,
  MapPin,
  DollarSign,
  Calendar,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SavedJob {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: {
      name: string;
      logo?: string;
    };
    location: string;
    type: string;
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
    industry: string;
    description?: string;
    createdAt: string;
  };
  savedAt: string;
}

export default function SavedJobsPage() {
  const toast = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null);

  const fetchSavedJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{
        savedJobs: SavedJob[];
        pagination: { page: number; limit: number; total: number; pages: number };
      }>("/api/saved-jobs?limit=100");

      // API returns { savedJobs: [...], pagination: {...} }
      if (response && 'savedJobs' in response) {
        setSavedJobs(response.savedJobs || []);
      } else {
        setSavedJobs([]);
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      const message = error instanceof Error ? error.message : "Failed to load saved jobs";
      toast.error(message);
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredJobs(savedJobs);
    } else {
      const filtered = savedJobs.filter(
        (savedJob) =>
          savedJob.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          savedJob.job.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          savedJob.job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [savedJobs, searchQuery]);

  const handleRemove = async () => {
    if (!selectedJob) return;

    try {
      await apiClient.delete(
        `/api/saved-jobs?jobId=${selectedJob.job._id}`
      );
      toast.success("Job removed from saved");
      setRemoveDialogOpen(false);
      setSelectedJob(null);
      fetchSavedJobs();
    } catch (error) {
      console.error("Error removing saved job:", error);
      const message = error instanceof Error ? error.message : "Failed to remove job";
      toast.error(message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
    });
  };

  const formatSalary = (salary?: { min?: number; max?: number; currency?: string }) => {
    if (!salary || (!salary.min && !salary.max)) return "Not specified";
    const currency = salary.currency || "AUD";
    if (salary.min && salary.max) {
      return `${currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
    }
    if (salary.min) return `${currency} ${salary.min.toLocaleString()}+`;
    if (salary.max) return `Up to ${currency} ${salary.max.toLocaleString()}`;
    return "Not specified";
  };

  const getTypeColor = (type: string) => {
    const normalizedType = type.replace("-", " ");
    const colors: Record<string, string> = {
      "Full-time": "bg-green-500/10 text-green-700 dark:text-green-400",
      "Part-time": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      Contract: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    };
    return colors[normalizedType] || "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10">
              <Bookmark className="h-6 w-6 text-[#B260E6]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
              <p className="text-muted-foreground mt-1">
                Your saved job listings ({filteredJobs.length} jobs)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className={
                viewMode === "grid"
                  ? "bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]"
                  : ""
              }
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className={
                viewMode === "list"
                  ? "bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]"
                  : ""
              }
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search saved jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Jobs Grid/List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading saved jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <DashboardCard
          title="No Saved Jobs"
          description="You haven't saved any jobs yet"
        >
          <div className="flex flex-col items-center justify-center py-12">
            <Bookmark className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Start saving jobs to see them here
            </p>
            <Link href="/user/jobs">
              <Button className="mt-4 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]">
                Browse Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </DashboardCard>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((savedJob, index) => (
            <motion.div
              key={savedJob._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="group overflow-hidden border-border bg-card/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-[#B260E6] transition-colors">
                        {savedJob.job.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {savedJob.job.company.name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setSelectedJob(savedJob);
                        setRemoveDialogOpen(true);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{savedJob.job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatSalary(savedJob.job.salary)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Saved {formatDate(savedJob.savedAt)}</span>
                    </div>
                  </div>

                  <Badge className={getTypeColor(savedJob.job.type)}>
                    {savedJob.job.type.replace("-", " ")}
                  </Badge>

                  <div className="mt-4 space-y-2">
                    <Link href={`/user/jobs/${savedJob.job._id}`}>
                      <Button className="w-full rounded-xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] hover:scale-[1.02] transition-transform">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <DashboardCard title={`${filteredJobs.length} Saved Jobs`}>
          <div className="space-y-4">
            {filteredJobs.map((savedJob, index) => (
              <motion.div
                key={savedJob._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {savedJob.job.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {savedJob.job.company.name}
                            </p>
                          </div>
                          <Badge className={getTypeColor(savedJob.job.type)}>
                            {savedJob.job.type.replace("-", " ")}
                          </Badge>
                        </div>
                        {savedJob.job.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {savedJob.job.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{savedJob.job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatSalary(savedJob.job.salary)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Saved {formatDate(savedJob.savedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setSelectedJob(savedJob);
                            setRemoveDialogOpen(true);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Link href={`/user/jobs/${savedJob.job._id}`}>
                          <Button className="rounded-xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] whitespace-nowrap">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </DashboardCard>
      )}

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Saved Job?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{selectedJob?.job.title}</strong> from your saved jobs?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
