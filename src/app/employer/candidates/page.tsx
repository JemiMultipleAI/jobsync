"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardCard from "@/components/shared/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { Users, Search, Download, Mail, MapPin, Award, MessageSquare, Calendar, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface Candidate {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  skills: string[];
  profileImage?: string;
  resume?: string;
  profileCompletion: number;
  badges?: Array<{
    trainingProgramId: string;
    badgeName: string;
    badgeIcon?: string;
    completedAt: string;
  }>;
  application?: {
    _id: string;
    job: {
      _id: string;
      title: string;
    };
    appliedAt?: string;
  };
}

export default function EmployerCandidatesPage() {
  const toast = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [offerType, setOfferType] = useState<"job" | "trial" | "interview" | "message">("message");
  const [offerMessage, setOfferMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch accepted applications
      const data = await apiClient.get<{ applications: Array<{
        _id: string;
        applicant: any;
        job: { _id: string; title: string };
        appliedAt?: string;
      }> }>("/api/employer/applications?status=accepted&limit=100");
      
      // Transform applications into candidates
      const candidatesList: Candidate[] = await Promise.all(
        (data.applications || []).map(async (app) => {
          try {
            // Fetch full worker details
            const workerRes = await apiClient.get<{ worker: any }>(`/api/employer/workers/${app.applicant._id}`);
            return {
              _id: app.applicant._id,
              name: workerRes.worker.name || app.applicant.name,
              email: workerRes.worker.email || app.applicant.email,
              bio: workerRes.worker.bio,
              location: workerRes.worker.location,
              skills: workerRes.worker.skills || [],
              profileImage: workerRes.worker.profileImage || app.applicant.profileImage,
              resume: workerRes.worker.resume || app.applicant.resume,
              profileCompletion: workerRes.worker.profileCompletion || 0,
              badges: workerRes.worker.badges || [],
              application: {
                _id: app._id,
                job: app.job,
                appliedAt: app.appliedAt,
              },
            };
          } catch {
            // Fallback to basic applicant data
            return {
              _id: app.applicant._id,
              name: app.applicant.name,
              email: app.applicant.email,
              skills: [],
              profileCompletion: 0,
              application: {
                _id: app._id,
                job: app.job,
                appliedAt: app.appliedAt,
              },
            };
          }
        })
      );
      
      setCandidates(candidatesList);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      const message = error instanceof Error ? error.message : "Failed to load candidates";
      toast.error(message);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const filterCandidates = useCallback(() => {
    let filtered = [...candidates];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(query) ||
          candidate.email.toLowerCase().includes(query) ||
          candidate.location?.toLowerCase().includes(query) ||
          candidate.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    setFilteredCandidates(filtered);
  }, [candidates, searchQuery]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  useEffect(() => {
    filterCandidates();
  }, [filterCandidates]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleSendMessage = async (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setOfferType("message");
    setOfferMessage("");
    setIsDialogOpen(true);
  };

  const handleOfferCandidate = (candidate: Candidate, type: "job" | "trial" | "interview" | "message") => {
    setSelectedCandidate(candidate);
    setOfferType(type);
    setOfferMessage("");
    setIsDialogOpen(true);
  };

  const handleSubmitOffer = async () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate");
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
          participantIds: [selectedCandidate._id],
        });
        
        // Send initial message via WebSocket or API
        if (offerMessage.trim()) {
          await apiClient.post(`/api/chat/conversations/${conversationRes.conversation._id}/messages`, {
            content: offerMessage,
          });
        }
        
        toast.success(`Message sent to ${selectedCandidate.name}`);
      } else {
        // Create offer (interview, trial, or job)
        const offerData: any = {
          type: offerType,
          applicantId: selectedCandidate._id,
          message: offerMessage,
        };

        // Add application ID if available
        if (selectedCandidate.application?._id) {
          offerData.applicationId = selectedCandidate.application._id;
        }

        // Add job ID if available
        if (selectedCandidate.application?.job?._id) {
          offerData.jobId = selectedCandidate.application.job._id;
        }

        await apiClient.post("/api/offers", offerData);
        
        const offerTypeLabels = {
          job: "Job Offer",
          trial: "Trial Period Offer",
          interview: "Interview Invitation",
        };
        toast.success(`${offerTypeLabels[offerType]} sent to ${selectedCandidate.name}`);
      }
      
      setIsDialogOpen(false);
      setSelectedCandidate(null);
      setOfferMessage("");
      fetchCandidates(); // Refresh
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Accepted Candidates</h1>
        <p className="text-muted-foreground mt-1">
          View candidates who have been accepted for your job openings.
        </p>
      </motion.div>

      {/* Search */}
      <DashboardCard title="Search Candidates" description="Find candidates by name, skills, or location">
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
      </DashboardCard>

      {/* Candidates List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredCandidates.length === 0 ? (
        <DashboardCard title="No Candidates Found" description="Accepted candidates will appear here">
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {candidates.length === 0
                ? "No accepted candidates yet. Accept applications to see them here."
                : "No candidates match your search."}
            </p>
          </div>
        </DashboardCard>
      ) : (
        <div className="space-y-4">
          {filteredCandidates.map((candidate) => (
            <motion.div
              key={candidate._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  {candidate.profileImage && (
                    <AvatarImage src={candidate.profileImage} alt={candidate.name} />
                  )}
                  <AvatarFallback className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white">
                    {getInitials(candidate.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.email}</p>
                      {candidate.application && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Accepted for: <span className="font-medium">{candidate.application.job.title}</span>
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {candidate.profileCompletion}% Complete
                    </Badge>
                  </div>
                  {candidate.bio && (
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {candidate.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {candidate.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {candidate.location}
                      </div>
                    )}
                  </div>
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {candidate.skills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 5 && (
                        <Badge variant="secondary">
                          +{candidate.skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                  {candidate.badges && candidate.badges.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Training Badges:</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.badges.map((badge, index) => (
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
                  <div className="flex flex-wrap gap-2">
                    {candidate.resume && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(candidate.resume, "_blank")}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        View Resume
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMessage(candidate)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOfferCandidate(candidate, "interview")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Offer Interview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOfferCandidate(candidate, "trial")}
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Offer Trial
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOfferCandidate(candidate, "job")}
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
    </div>
  );
}
