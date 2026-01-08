"use client";

import { useState, useEffect } from "react";
import DashboardCard from "@/components/admin/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { FileText, Eye, Download, Mail } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface Application {
  _id: string;
  user: {
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
  createdAt: string;
}

export default function EmployerApplicationsPage() {
  const toast = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedJob, setSelectedJob] = useState("all");
  const [jobs, setJobs] = useState<any[]>([]);
  const [userCompany, setUserCompany] = useState<any>(null);

  useEffect(() => {
    fetchUserCompany();
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [selectedStatus, selectedJob, applications]);

  const fetchUserCompany = async () => {
    try {
      const profileRes = await apiClient.get<{ user: any }>("/api/auth/profile");
      const userId = profileRes.user._id;

      const companiesRes = await apiClient.get<{ companies: any[] }>("/api/companies?limit=100");
      const userCompanies = companiesRes.companies.filter((c: any) => c.createdBy === userId);
      
      if (userCompanies.length > 0) {
        setUserCompany(userCompanies[0]);
        
        // Fetch jobs for this company
        const jobsRes = await apiClient.get<{ jobs: any[] }>("/api/jobs?limit=100");
        const companyJobs = jobsRes.jobs.filter((j: any) => j.company._id === userCompanies[0]._id);
        setJobs(companyJobs);
      }
    } catch (error: any) {
      console.error("Error fetching user company:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<{ applications: Application[]; pagination: any }>(
        "/api/applications?limit=100"
      );
      
      // Filter applications for jobs posted by this employer
      if (userCompany) {
        const employerJobIds = jobs.map((j: any) => j._id);
        const filtered = data.applications.filter((app: Application) => 
          employerJobIds.includes(app.job?._id || app.job)
        );
        setApplications(filtered);
      } else {
        setApplications(data.applications);
      }
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      toast.error(error.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userCompany && jobs.length > 0) {
      fetchApplications();
    }
  }, [userCompany, jobs]);

  const filterApplications = () => {
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
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      await apiClient.put(`/api/applications/${applicationId}`, {
        status: newStatus,
      });
      toast.success("Application status updated");
      fetchApplications();
    } catch (error: any) {
      console.error("Error updating application:", error);
      toast.error(error.message || "Failed to update application");
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
                      {application.user?.name || "Unknown Candidate"}
                    </h3>
                    {getStatusBadge(application.status)}
                  </div>
                  <p className="text-muted-foreground mb-2">
                    Applied for: <span className="font-medium">{application.job?.title}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Applied on {formatDate(application.createdAt)}
                  </p>
                  {application.coverLetter && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {application.coverLetter}
                    </p>
                  )}
                  <div className="flex gap-2">
                    {application.user?.resume && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(application.user.resume, "_blank")}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        View Resume
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `mailto:${application.user?.email}`}
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


