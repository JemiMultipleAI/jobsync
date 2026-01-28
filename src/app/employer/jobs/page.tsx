"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardCard from "@/components/admin/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Job {
  _id: string;
  title: string;
  company: {
    _id: string;
    name: string;
  };
  type: string;
  status: string;
  location: string;
  industry: string;
  description: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  createdAt: string;
}

interface Company {
  _id: string;
  name: string;
}

export default function EmployerJobsPage() {
  const toast = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userCompany, setUserCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    type: "full-time",
    location: "",
    industry: "",
    description: "",
    status: "active",
    salaryMin: "",
    salaryMax: "",
    salaryPeriod: "year",
  });

  const fetchUserCompany = useCallback(async () => {
    try {
      const profileRes = await apiClient.get<{ 
        user: { 
          _id: string; 
          company?: string | { _id: string; name: string } 
        } 
      }>("/api/auth/profile");
      
      // Use user.company from profile (new method)
      if (profileRes.user.company) {
        const companyId = typeof profileRes.user.company === 'string' 
          ? profileRes.user.company 
          : profileRes.user.company._id;
        
        // Fetch company details
        const companyRes = await apiClient.get<{ company: Company }>(
          `/api/companies/${companyId}`
        );
        setUserCompany(companyRes.company);
        setFormData(prev => ({ ...prev, company: companyRes.company._id }));
      } else {
        toast.info("Please create or link a company profile first");
      }
    } catch (error) {
      console.error("Error fetching user company:", error);
      const message = error instanceof Error ? error.message : "Failed to load company information";
      toast.error(message);
    }
  }, [toast]);

  useEffect(() => {
    fetchUserCompany();
  }, [fetchUserCompany]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      // Use employer-specific endpoint (already filtered by company)
      const data = await apiClient.get<{ jobs: Job[]; pagination: { page: number; limit: number; total: number; pages: number } }>(
        "/api/employer/jobs?limit=100"
      );
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      const message = error instanceof Error ? error.message : "Failed to load jobs";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (userCompany) {
      fetchJobs();
    }
  }, [userCompany, fetchJobs]);

  const handleCreate = () => {
    if (!userCompany) {
      toast.error("Please create a company profile first");
      return;
    }
    setIsEditMode(false);
    setEditingJob(null);
    setFormData({
      title: "",
      company: userCompany._id,
      type: "full-time",
      location: "",
      industry: "",
      description: "",
      status: "active",
      salaryMin: "",
      salaryMax: "",
      salaryPeriod: "year",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (job: Job) => {
    setIsEditMode(true);
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company._id,
      type: job.type,
      location: job.location,
      industry: job.industry,
      description: job.description,
      status: job.status,
      salaryMin: job.salary?.min?.toString() || "",
      salaryMax: job.salary?.max?.toString() || "",
      salaryPeriod: job.salary?.period || "year",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (job: Job) => {
    if (!confirm(`Are you sure you want to delete "${job.title}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/api/jobs/${job._id}`);
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      const message = error instanceof Error ? error.message : "Failed to delete job";
      toast.error(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCompany) {
      toast.error("Please create a company profile first");
      return;
    }

    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        title: formData.title,
        company: formData.company || userCompany._id,
        type: formData.type,
        location: formData.location,
        industry: formData.industry,
        description: formData.description,
        status: formData.status,
      };

      if (formData.salaryMin || formData.salaryMax) {
        payload.salary = {
          min: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
          max: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
          currency: "AUD",
          period: formData.salaryPeriod,
        };
      }

      if (isEditMode && editingJob) {
        await apiClient.put(`/api/jobs/${editingJob._id}`, payload);
        toast.success("Job updated successfully");
      } else {
        await apiClient.post("/api/jobs", payload);
        toast.success("Job created successfully");
      }

      setIsDialogOpen(false);
      fetchJobs();
    } catch (error) {
      console.error("Error saving job:", error);
      const message = error instanceof Error ? error.message : "Failed to save job";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      active: { label: "Active", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
      inactive: { label: "Inactive", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
      draft: { label: "Draft", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
    };
    const variant = variants[status] || { label: status, className: "bg-gray-500/10 text-gray-700" };
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      "full-time": { label: "Full-time", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
      "part-time": { label: "Part-time", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
      contract: { label: "Contract", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
      temporary: { label: "Temporary", className: "bg-pink-500/10 text-pink-700 dark:text-pink-400" },
    };
    const variant = variants[type] || { label: type, className: "bg-gray-500/10 text-gray-700" };
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your job listings and track applications.
          </p>
        </div>
        <Button onClick={handleCreate} disabled={!userCompany}>
          <Plus className="mr-2 h-4 w-4" />
          Post New Job
        </Button>
      </motion.div>

      {!userCompany && (
        <DashboardCard title="Company Required" description="Create a company profile to post jobs">
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">
              You need to create a company profile before posting jobs.
            </p>
            <Button asChild>
              <a href="/employer/company">Create Company Profile</a>
            </Button>
          </div>
        </DashboardCard>
      )}

      {/* Jobs List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <DashboardCard title="No Jobs Posted" description="Get started by posting your first job">
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">
              You haven't posted any jobs yet.
            </p>
            <Button onClick={handleCreate} disabled={!userCompany}>
              <Plus className="mr-2 h-4 w-4" />
              Post Your First Job
            </Button>
          </div>
        </DashboardCard>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    {getStatusBadge(job.status)}
                    {getTypeBadge(job.type)}
                  </div>
                  <p className="text-muted-foreground mb-3 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.industry}</span>
                    {job.salary && (
                      <>
                        <span>•</span>
                        <span>
                          ${job.salary.min?.toLocaleString() || "N/A"}
                          {job.salary.max && ` - $${job.salary.max.toLocaleString()}`}
                          /{job.salary.period || "year"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(job)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(job)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Job" : "Post New Job"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the job posting details."
                : "Fill in the details to create a new job posting."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Job Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                    placeholder="e.g., Sydney, NSW"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    required
                    placeholder="e.g., Technology"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={6}
                  placeholder="Describe the role, responsibilities, and requirements..."
                />
              </div>

              <div className="space-y-2">
                <Label>Salary (Optional)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="salaryMin" className="text-xs">
                      Min (AUD)
                    </Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) =>
                        setFormData({ ...formData, salaryMin: e.target.value })
                      }
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryMax" className="text-xs">
                      Max (AUD)
                    </Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) =>
                        setFormData({ ...formData, salaryMax: e.target.value })
                      }
                      placeholder="80000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryPeriod" className="text-xs">
                      Period
                    </Label>
                    <Select
                      value={formData.salaryPeriod}
                      onValueChange={(value) =>
                        setFormData({ ...formData, salaryPeriod: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="year">Per Year</SelectItem>
                        <SelectItem value="month">Per Month</SelectItem>
                        <SelectItem value="hour">Per Hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : isEditMode ? "Update Job" : "Post Job"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}



