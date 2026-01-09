"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardCard from "@/components/admin/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { FileText, Download, Mail } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Application {
  _id: string;
  applicant: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    resume?: string;
  };
  job: {
    _id: string;
    title: string;
    company: {
      _id: string;
      name: string;
    };
  };
  status: string;
  coverLetter?: string;
  appliedAt?: string;
  createdAt: string;
}

export default function EmployerApplicationsPage() {
  const toast = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedJob, setSelectedJob] = useState("all");
  const [jobs, setJobs] = useState<Array<{ _id: string; title: string; company: { _id: string } }>>([]);
  const [userCompany, setUserCompany] = useState<{ _id: string; name: string } | null>(null);

  const fetchUserCompany = useCallback(async () => {
    try {
      const profileRes = await apiClient.get<{ user: { _id: string; company?: string | { _id: string; name: string } } }>("/api/auth/profile");
      
      // Use user.company from profile (new method)
      if (profileRes.user.company) {
        const companyId = typeof profileRes.user.company === 'string' 
          ? profileRes.user.company 
          : profileRes.user.company._id;
        
        // Fetch company details
        const companyRes = await apiClient.get<{ company: { _id: string; name: string } }>(
          `/api/companies/${companyId}`
        );
        setUserCompany(companyRes.company);
        
        // Fetch jobs for this company (already filtered by API)
        const jobsRes = await apiClient.get<{ jobs: Array<{ _id: string; title: string; company: { _id: string } }> }>("/api/employer/jobs?limit=100");
        setJobs(jobsRes.jobs || []);
      } else {
        toast.info("Please create or link a company profile first");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load company information";
      toast.error(message);
    }
  }, [toast]);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      // Use employer-specific endpoint (already filtered by company)
      const data = await apiClient.get<{ applications: Application[]; pagination: unknown }>(
        "/api/employer/applications?limit=100"
      );
      setApplications(data.applications || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load applications";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUserCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userCompany) {
      fetchApplications();
    }
  }, [userCompany, fetchApplications]);

  const filterApplications = useCallback(() => {
    let filtered = [...applications];

    if (selectedStatus !== "all") {
      filtered = filtered.filter((app) => app.status === selectedStatus);
    }

    if (selectedJob !== "all") {
      filtered = filtered.filter((app) => 
        app.job?._id === selectedJob || String(app.job?._id) === selectedJob
      );
    }

    setFilteredApplications(filtered);
  }, [selectedStatus, selectedJob, applications]);

  useEffect(() => {
    filterApplications();
  }, [filterApplications]);

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      await apiClient.put(`/api/applications/${applicationId}`, {
        status: newStatus,
      });
      toast.success("Application status updated");
      fetchApplications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update application";
      toast.error(message);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
      under_review: { label: "Under Review", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
      shortlisted: { label: "Shortlisted", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
      rejected: { label: "Rejected", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
      accepted: { label: "Accepted", className: "bg-green-600/10 text-green-800 dark:text-green-500" },
    };
    const variant = variants[status] || { label: status, className: "bg-gray-500/10 text-gray-700" };
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Job Applications</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage applications for your job postings.
        </p>
      </motion.div>

      {/* Filters */}
      <DashboardCard title="Filters" description="Filter applications by status or job">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Job</label>
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job._id} value={job._id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DashboardCard>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <DashboardCard title="No Applications" description="Applications will appear here">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {applications.length === 0
                ? "No applications received yet."
                : "No applications match your filters."}
            </p>
          </div>
        </DashboardCard>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <motion.div
              key={application._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">
                      {application.applicant?.name || "Unknown Candidate"}
                    </h3>
                    {getStatusBadge(application.status)}
                  </div>
                  <p className="text-muted-foreground mb-2">
                    Applied for: <span className="font-medium">{application.job?.title}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Applied on {formatDate(application.appliedAt || application.createdAt)}
                  </p>
                  {application.coverLetter && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {application.coverLetter}
                    </p>
                  )}
                  <div className="flex gap-2">
                    {application.applicant?.resume && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(application.applicant.resume, "_blank")}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        View Resume
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `mailto:${application.applicant?.email}`}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                  </div>
                </div>
                <div className="ml-4">
                  <Select
                    value={application.status}
                    onValueChange={(value) =>
                      updateApplicationStatus(application._id, value)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}


