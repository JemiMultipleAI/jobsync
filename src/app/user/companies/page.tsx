"use client";

import { useState, useEffect } from "react";
import DashboardCard from "@/components/admin/DashboardCard";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { Eye, Briefcase } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Search,
  MapPin,
  Users,
  Heart,
  Filter,
  BadgeCheck,
} from "lucide-react";

interface Company {
  _id: string;
  name: string;
  industry: string;
  location: string;
  employees?: string;
  openJobs: number;
  description: string;
  logo?: string;
  coverImage?: string;
  rating?: number;
  verified: boolean;
  established?: number;
}

export default function CompaniesPage() {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [followedCompanies, setFollowedCompanies] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, [selectedIndustry, selectedLocation, searchQuery]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: "1",
        limit: "20",
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

      const data = await apiClient.get<{ companies: Company[]; pagination: any }>(
        `/api/companies?${params.toString()}`
      );
      setCompanies(data.companies);
    } catch (error: any) {
      console.error("Error fetching companies:", error);
      toast.error(error.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = (companyId: string) => {
    if (followedCompanies.includes(companyId)) {
      setFollowedCompanies(followedCompanies.filter((id) => id !== companyId));
      toast.info("Company removed from followed");
    } else {
      setFollowedCompanies([...followedCompanies, companyId]);
      toast.success("Company added to followed");
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedIndustry("All");
    setSelectedLocation("All");
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
            <Building2 className="h-6 w-6 text-[#B260E6]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
            <p className="text-muted-foreground mt-1">
              {loading ? "Loading..." : `Explore companies and find your perfect match (${companies.length} companies)`}
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
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select
                  value={selectedIndustry}
                  onValueChange={(value) => {
                    setSelectedIndustry(value);
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

              {/* Location */}
              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  value={selectedLocation}
                  onValueChange={(value) => {
                    setSelectedLocation(value);
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

              {/* Reset Filters */}
              <Button variant="outline" className="w-full" onClick={resetFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </DashboardCard>
        </div>

        {/* Companies Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <DashboardCard title="Loading..." description="Fetching companies">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground">Loading companies...</p>
              </div>
            </DashboardCard>
          ) : companies.length === 0 ? (
            <DashboardCard title="No Companies Found" description="Try adjusting your filters">
              <div className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No companies match your criteria</p>
              </div>
            </DashboardCard>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {companies.map((company, index) => (
                <motion.div
                  key={company._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="group overflow-hidden border-border bg-card/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {company.logo ? (
                              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200">
                                <img
                                  src={company.logo}
                                  alt={company.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white font-bold text-lg shadow-lg">
                                {company.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg group-hover:text-[#B260E6] transition-colors">
                                  {company.name}
                                </h3>
                                {company.verified && (
                                  <BadgeCheck className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                              <Badge variant="secondary" className="mt-1">
                                {company.industry}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={
                            followedCompanies.includes(company._id)
                              ? "text-[#ED84A5] hover:text-[#ED84A5]"
                              : "text-muted-foreground hover:text-[#ED84A5]"
                          }
                          onClick={() => toggleFollow(company._id)}
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              followedCompanies.includes(company._id)
                                ? "fill-current"
                                : ""
                            }`}
                          />
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {company.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{company.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{company.employees || "N/A"} employees</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="h-4 w-4" />
                          <span className="font-medium text-[#B260E6]">
                            {company.openJobs} open jobs
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/companies/${company._id}`}>
                          <Button variant="outline" className="flex-1 rounded-xl">
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </Button>
                        </Link>
                        <Link href={`/companies/${company._id}/jobs`}>
                          <Button
                            className="flex-1 rounded-xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] hover:scale-[1.02] transition-transform"
                          >
                            View Jobs
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
