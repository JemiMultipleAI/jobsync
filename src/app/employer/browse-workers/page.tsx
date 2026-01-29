"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardCard from "@/components/shared/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { Users, Search, Download, Mail, MapPin, Briefcase, Calendar, MessageSquare, Award, CreditCard, Building, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Worker {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  skills: string[];
  profileImage?: string;
  resume?: string;
  profileCompletion: number;
  phone?: string;
  bankDetails?: {
    accountName?: string;
    bsb?: string;
    accountNumber?: string;
  };
  superannuation?: {
    fundName?: string;
    memberNumber?: string;
    usi?: string;
  };
  taxFileNumber?: string;
  badges?: Array<{
    trainingProgramId: string;
    badgeName: string;
    badgeIcon?: string;
    completedAt: string;
  }>;
}

export default function BrowseWorkersPage() {
  const toast = useToast();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [offerType, setOfferType] = useState<"job" | "trial" | "interview" | "message">("message");
  const [offerMessage, setOfferMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinancialInfo, setShowFinancialInfo] = useState(false);

  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all workers (users with role "user") for employers
      const response = await apiClient.get<{ workers: Worker[]; pagination: { total: number } }>("/api/employer/workers?limit=100");
      setWorkers(response.workers || []);
    } catch (error) {
      console.error("Error fetching workers:", error);
      const message = error instanceof Error ? error.message : "Failed to load workers";
      toast.error(message);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const filterWorkers = useCallback(() => {
    let filtered = [...workers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (worker) =>
          worker.name.toLowerCase().includes(query) ||
          worker.email.toLowerCase().includes(query) ||
          worker.location?.toLowerCase().includes(query) ||
          worker.skills.some((skill) => skill.toLowerCase().includes(query)) ||
          worker.bio?.toLowerCase().includes(query)
      );
    }

    setFilteredWorkers(filtered);
  }, [workers, searchQuery]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  useEffect(() => {
    filterWorkers();
  }, [filterWorkers]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleOfferWorker = (worker: Worker, type: "job" | "trial" | "interview" | "message") => {
    setSelectedWorker(worker);
    setOfferType(type);
    setOfferMessage("");
    setShowFinancialInfo(false);
    setIsDialogOpen(true);
  };

  const handleSubmitOffer = async () => {
    if (!selectedWorker || !offerMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, you would send this to an API endpoint
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const offerTypeLabels = {
        job: "Job Offer",
        trial: "Trial Period",
        interview: "Interview Invitation",
        message: "Message",
      };

      toast.success(`${offerTypeLabels[offerType]} sent to ${selectedWorker.name}`);
      setIsDialogOpen(false);
      setSelectedWorker(null);
      setOfferMessage("");
    } catch (error) {
      toast.error("Failed to send offer. Please try again.");
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
        <h1 className="text-3xl font-bold tracking-tight">Browse Workers</h1>
        <p className="text-muted-foreground mt-1">
          Discover and connect with talented workers. Offer them jobs, trials, interviews, or send messages.
        </p>
      </motion.div>

      {/* Search */}
      <DashboardCard title="Search Workers" description="Find workers by name, skills, location, or bio">
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
        <div className="mt-4 text-sm text-muted-foreground">
          Found {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? "s" : ""}
        </div>
      </DashboardCard>

      {/* Workers List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredWorkers.length === 0 ? (
        <DashboardCard title="No Workers Found" description="Workers will appear here">
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {workers.length === 0
                ? "No workers registered yet."
                : "No workers match your search."}
            </p>
          </div>
        </DashboardCard>
      ) : (
        <div className="space-y-4">
          {filteredWorkers.map((worker) => (
            <motion.div
              key={worker._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  {worker.profileImage && (
                    <AvatarImage src={worker.profileImage} alt={worker.name} />
                  )}
                  <AvatarFallback className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white">
                    {getInitials(worker.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold">{worker.name}</h3>
                      <p className="text-sm text-muted-foreground">{worker.email}</p>
                    </div>
                    <Badge variant="outline">
                      {worker.profileCompletion}% Complete
                    </Badge>
                  </div>
                  {worker.bio && (
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {worker.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {worker.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {worker.location}
                      </div>
                    )}
                  </div>
                  {worker.skills && worker.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {worker.skills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                      {worker.skills.length > 5 && (
                        <Badge variant="secondary">
                          +{worker.skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                  {worker.badges && worker.badges.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Training Badges:</p>
                      <div className="flex flex-wrap gap-2">
                        {worker.badges.map((badge, index) => (
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
                    {worker.resume && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(worker.resume, "_blank")}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        View Resume
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOfferWorker(worker, "message")}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOfferWorker(worker, "interview")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Offer Interview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOfferWorker(worker, "trial")}
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Offer Trial
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white"
                      onClick={() => handleOfferWorker(worker, "job")}
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

      {/* Offer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {offerType === "job" && "Offer Job"}
              {offerType === "trial" && "Offer Trial Period"}
              {offerType === "interview" && "Offer Interview"}
              {offerType === "message" && "Send Message"}
            </DialogTitle>
            <DialogDescription>
              {selectedWorker && (
                <>
                  To: <strong>{selectedWorker.name}</strong> ({selectedWorker.email})
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder={
                  offerType === "job"
                    ? "Describe the job position, requirements, and benefits..."
                    : offerType === "trial"
                    ? "Describe the trial period, duration, and expectations..."
                    : offerType === "interview"
                    ? "Provide interview details, date, time, and location..."
                    : "Enter your message..."
                }
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                rows={6}
                className="mt-2"
              />
            </div>
            
            {/* Financial Information Section - Only shown when worker has provided it */}
            {selectedWorker && (selectedWorker.bankDetails || selectedWorker.superannuation || selectedWorker.taxFileNumber) && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setShowFinancialInfo(!showFinancialInfo)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[#B260E6]" />
                    <span className="font-semibold text-sm">Financial Information</span>
                    <span className="text-xs text-muted-foreground">(Available after hiring)</span>
                  </div>
                  {showFinancialInfo ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                {showFinancialInfo && (
                  <div className="mt-4 space-y-4 text-sm">
                    {selectedWorker.bankDetails && (selectedWorker.bankDetails.accountName || selectedWorker.bankDetails.bsb || selectedWorker.bankDetails.accountNumber) && (
                      <div>
                        <p className="font-semibold mb-2 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Bank Details
                        </p>
                        <div className="space-y-1 text-muted-foreground pl-6">
                          {selectedWorker.bankDetails.accountName && (
                            <p>Account Name: {selectedWorker.bankDetails.accountName}</p>
                          )}
                          {selectedWorker.bankDetails.bsb && (
                            <p>BSB: {selectedWorker.bankDetails.bsb}</p>
                          )}
                          {selectedWorker.bankDetails.accountNumber && (
                            <p>Account Number: {selectedWorker.bankDetails.accountNumber}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {selectedWorker.superannuation && (selectedWorker.superannuation.fundName || selectedWorker.superannuation.memberNumber) && (
                      <div>
                        <p className="font-semibold mb-2 flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Superannuation
                        </p>
                        <div className="space-y-1 text-muted-foreground pl-6">
                          {selectedWorker.superannuation.fundName && (
                            <p>Fund Name: {selectedWorker.superannuation.fundName}</p>
                          )}
                          {selectedWorker.superannuation.memberNumber && (
                            <p>Member Number: {selectedWorker.superannuation.memberNumber}</p>
                          )}
                          {selectedWorker.superannuation.usi && (
                            <p>USI: {selectedWorker.superannuation.usi}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {selectedWorker.taxFileNumber && (
                      <div>
                        <p className="font-semibold mb-2 flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Tax File Number
                        </p>
                        <p className="text-muted-foreground pl-6 font-mono">
                          {selectedWorker.taxFileNumber}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                      This information is only visible after the worker is hired and is used for payroll processing.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitOffer}
              disabled={isSubmitting || !offerMessage.trim()}
              className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  {offerType === "job" && "Send Job Offer"}
                  {offerType === "trial" && "Send Trial Offer"}
                  {offerType === "interview" && "Send Interview Invitation"}
                  {offerType === "message" && "Send Message"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
