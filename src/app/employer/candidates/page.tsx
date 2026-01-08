"use client";

import { useState, useEffect } from "react";
import DashboardCard from "@/components/admin/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { Users, Search, Download, Mail, MapPin, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
}

export default function EmployerCandidatesPage() {
  const toast = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [searchQuery, candidates]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      // Note: This would typically be a dedicated candidates API endpoint
      // For now, we'll use a placeholder - in production, create /api/candidates
      // that returns all users with role "user"
      toast.info("Candidates feature coming soon");
      setCandidates([]);
    } catch (error: any) {
      console.error("Error fetching candidates:", error);
      toast.error(error.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const filterCandidates = () => {
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
        <h1 className="text-3xl font-bold tracking-tight">Browse Candidates</h1>
        <p className="text-muted-foreground mt-1">
          Discover talented candidates for your job openings.
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
        <DashboardCard title="No Candidates Found" description="Candidates will appear here">
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {candidates.length === 0
                ? "No candidates available yet."
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
                  <div className="flex gap-2">
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
                      onClick={() => window.location.href = `mailto:${candidate.email}`}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Contact
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


