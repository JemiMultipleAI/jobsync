"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardCard from "@/components/shared/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { FileText, Download, Mail, MessageSquare, Briefcase, Calendar, MapPin, Award, Users, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

interface Application {
  _id: string;
  applicant: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    resume?: string;
    bio?: string;
    location?: string;
    skills?: string[];
    badges?: Array<{
      trainingProgramId: string;
      badgeName: string;
      badgeIcon?: string;
      completedAt: string;
    }>;
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
  const router = useRouter();
  const toast = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedJob, setSelectedJob] = useState("all");
  const [jobs, setJobs] = useState<Array<{ _id: string; title: string; company: { _id: string } }>>([]);
  const [userCompany, setUserCompany] = useState<{ _id: string; name: string } | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [offerType, setOfferType] = useState<"job" | "trial" | "interview" | "message">("message");
  const [offerMessage, setOfferMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUserCompany = useCallback(async () => {
    try {
      const profileRes = await apiClient.get<{ user: { _id: string; company?: string | { _id: string; name: string } } }>("/api/auth/profile");
      
      if (profileRes.user.company) {
        const companyId = typeof profileRes.user.company === 'string' 
          ? profileRes.user.company 
          : profileRes.user.company._id;
        
        const companyRes = await apiClient.get<{ company: { _id: string; name: string } }>(
          `/api/companies/${companyId}`
        );
        setUserCompany(companyRes.company);
        
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
      const data = await apiClient.get<{ applications: Application[]; pagination: unknown }>(
        "/api/employer/applications?limit=100"
      );
      // Fetch full applicant details for each application (optional - use what's available)
      const applicationsWithDetails = await Promise.all(
        (data.applications || []).map(async (app) => {
          try {
            const workerRes = await apiClient.get<{ worker: any }>(`/api/employer/workers/${app.applicant._id}`);
            return {
              ...app,
              applicant: {
                ...app.applicant,
                bio: workerRes.worker?.bio || app.applicant.bio,
                location: workerRes.worker?.location || app.applicant.location,
                skills: workerRes.worker?.skills || app.applicant.skills || [],
                badges: workerRes.worker?.badges || [],
              },
            };
          } catch {
            // If worker fetch fails, use basic applicant data
            return {
              ...app,
              applicant: {
                ...app.applicant,
                skills: app.applicant.skills || [],
                badges: [],
              },
            };
          }
        })
      );
      setApplications(applicationsWithDetails);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load applications";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUserCompany();
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

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.applicant?.name?.toLowerCase().includes(query) ||
          app.applicant?.email?.toLowerCase().includes(query) ||
          app.applicant?.location?.toLowerCase().includes(query) ||
          app.applicant?.skills?.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    setFilteredApplications(filtered);
  }, [selectedStatus, selectedJob, applications, searchQuery]);

  useEffect(() => {
    filterApplications();
  }, [filterApplications]);

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      await apiClient.put(`/api/applications/${applicationId}`, {
        status: newStatus,
      });
      toast.success("Application status updated");
      
      // If status is accepted, move to candidates (refresh candidates page data)
      if (newStatus === "accepted") {
        // The candidates page will automatically show accepted applications
        toast.info("Application moved to candidates");
      }
      
      fetchApplications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update application";
      toast.error(message);
    }
  };

  const handleSendMessage = async (application: Application) => {
    setSelectedApplicant(application);
    setOfferType("message");
    setOfferMessage("");
    setIsDialogOpen(true);
  };

  const handleOfferWorker = (application: Application, type: "job" | "trial" | "interview" | "message") => {
    setSelectedApplicant(application);
    setOfferType(type);
    setOfferMessage("");
    setIsDialogOpen(true);
  };

  const handleSubmitOffer = async () => {
    if (!selectedApplicant) {
      toast.error("Please select an applicant");
      return;
    }

    if (offerType !== "message" && !offerMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSubmitting(true);
    try {
      if (offerType === "message") {
        // Create a chat conversation
        const conversationRes = await apiClient.post<{ conversation: { _id: string } }>("/api/chat/conversations", {
          type: "direct",
          participantIds: [selectedApplicant.applicant._id],
        });
        
        // Send initial message via WebSocket or API
        if (offerMessage.trim()) {
          await apiClient.post(`/api/chat/conversations/${conversationRes.conversation._id}/messages`, {
            content: offerMessage,
          });
        }
        
        toast.success(`Message sent to ${selectedApplicant.applicant.name}`);
      } else {
        // Create offer (interview, trial, or job)
        const offerData: any = {
          type: offerType,
          applicantId: selectedApplicant.applicant._id,
          message: offerMessage,
        };

        // Add application ID if available
        if (selectedApplicant._id) {
          offerData.applicationId = selectedApplicant._id;
        }

        // Add job ID if available
        if (selectedApplicant.job?._id) {
          offerData.jobId = selectedApplicant.job._id;
        }

        await apiClient.post("/api/offers", offerData);
        
        const offerTypeLabels = {
          job: "Job Offer",
          trial: "Trial Period Offer",
          interview: "Interview Invitation",
        };
        toast.success(`${offerTypeLabels[offerType]} sent to ${selectedApplicant.applicant.name}`);
      }
      
      setIsDialogOpen(false);
      setSelectedApplicant(null);
      setOfferMessage("");
      fetchApplications(); // Refresh to show updated status
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
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

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, skills, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
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
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  {application.applicant?.profileImage && (
                    <AvatarImage src={application.applicant.profileImage} alt={application.applicant.name} />
                  )}
                  <AvatarFallback className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white">
                    {getInitials(application.applicant?.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">
                          {application.applicant?.name || "Unknown Candidate"}
                        </h3>
                        {getStatusBadge(application.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{application.applicant?.email}</p>
                    </div>
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
                  <p className="text-muted-foreground mb-2">
                    Applied for: <span className="font-medium">{application.job?.title}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Applied on {formatDate(application.appliedAt || application.createdAt)}
                  </p>
                  {application.applicant?.bio && (
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {application.applicant.bio}
                    </p>
                  )}
                  {application.applicant?.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      {application.applicant.location}
                    </div>
                  )}
                  {application.applicant?.skills && application.applicant.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {application.applicant.skills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                      {application.applicant.skills.length > 5 && (
                        <Badge variant="secondary">
                          +{application.applicant.skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                  {application.applicant?.badges && application.applicant.badges.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Training Badges:</p>
                      <div className="flex flex-wrap gap-2">
                        {application.applicant.badges.map((badge, index) => (
                          <Badge key={index} className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white">
                            {badge.badgeIcon && (
                              <img src={badge.badgeIcon} alt="" className="h-3 w-3 mr-1 rounded" />
                            )}
                            {!badge.badgeIcon && <Award className="h-3 w-3 mr-1" />}
                            {badge.badgeName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {application.coverLetter && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {application.coverLetter}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
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
                      onClick={() => handleSendMessage(application)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOfferWorker(application, "interview")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Offer Interview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOfferWorker(application, "trial")}
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Offer Trial
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOfferWorker(application, "job")}
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Offer Job
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Offer/Message Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {offerType === "message" && "Send Message"}
              {offerType === "interview" && "Offer Interview"}
              {offerType === "trial" && "Offer Trial Period"}
              {offerType === "job" && "Offer Job"}
            </DialogTitle>
            <DialogDescription>
              {selectedApplicant && `To: ${selectedApplicant.applicant?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message..."
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitOffer} disabled={isSubmitting || !offerMessage.trim()}>
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
