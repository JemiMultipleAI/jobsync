"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import React from "react";
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
  DialogTrigger,
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

export default function JobsPage() {
  const toast = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
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

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<{ jobs: Job[]; pagination: any }>(
        "/api/jobs?limit=100"
      );
      setJobs(data.jobs);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast.error(error.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await apiClient.get<{ companies: Company[] }>(
        "/api/companies?limit=100"
      );
      setCompanies(data.companies);
    } catch (error: any) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingJob(null);
    setFormData({
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
    } catch (error: any) {
      console.error("Error deleting job:", error);
      toast.error(error.message || "Failed to delete job");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: any = {
        title: formData.title,
        company: formData.company,
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
    } catch (error: any) {
      console.error("Error saving job:", error);
      toast.error(error.message || "Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between pb-2"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Jobs
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage all job listings and postings.
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Job
        </Button>
      </motion.div>

      {/* Jobs Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      ) : (
        <DataTable
          data={jobs.map((job) => ({
            ...job,
            company: job.company.name,
            postedDate: job.createdAt,
          }))}
          columns={[
            {
              key: "title",
              label: "Title",
              render: (value) => (
                <span className="font-medium">{String(value)}</span>
              ),
            },
            {
              key: "company",
              label: "Company",
            },
            {
              key: "type",
              label: "Type",
              render: (value) => (
                <Badge variant="outline">{String(value).replace("-", " ")}</Badge>
              ),
            },
            {
              key: "location",
              label: "Location",
            },
            {
              key: "status",
              label: "Status",
              render: (value) => {
                const variants = {
                  active: "default",
                  closed: "secondary",
                  draft: "outline",
                } as const;
                return (
                  <Badge variant={variants[value as keyof typeof variants] || "outline"}>
                    {String(value)}
                  </Badge>
                );
              },
            },
            {
              key: "postedDate",
              label: "Posted Date",
              render: (value) => new Date(String(value)).toLocaleDateString(),
            },
          ]}
          searchable={true}
          searchPlaceholder="Search jobs..."
          onEdit={(job) => handleEdit(job as unknown as Job)}
          onDelete={(job) => handleDelete(job as unknown as Job)}
          actions={true}
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Job" : "Add New Job"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the job listing details below."
                : "Create a new job listing. Fill in all the details below."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Developer"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company *</Label>
                <Select
                  value={formData.company}
                  onValueChange={(value) =>
                    setFormData({ ...formData, company: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company._id} value={company._id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
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
                <div className="grid gap-2">
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
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Job description and requirements..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="salaryMin">Salary Min (AUD)</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    placeholder="e.g., 80000"
                    value={formData.salaryMin}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryMin: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="salaryMax">Salary Max (AUD)</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="e.g., 120000"
                    value={formData.salaryMax}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryMax: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="salaryPeriod">Period</Label>
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl transition-transform duration-200 hover:scale-[1.02]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : isEditMode ? "Update Job" : "Create Job"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
