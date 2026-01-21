"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Shield } from "lucide-react";
import { 
  MapPin, 
  Clock, 
  ArrowRight,
  DollarSign,
  Briefcase,
  Search
} from "lucide-react"
import Image from "next/image";

interface Job {
  _id: string;
  title: string;
  company: {
    _id: string;
    name: string;
    logo?: string;
  };
  location: string;
  type: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  industry: string;
  image?: string;
  createdAt: string;
}

export default function JobsPage() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedSalaryMin, setSelectedSalaryMin] = useState("All");
  const [selectedSalaryMax, setSelectedSalaryMax] = useState("All");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page] = useState(1); // Page state for future pagination

  // Read search query from URL on mount
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  // Industries
  const industries = [
    "All",
    "Technology",
    "Construction",
    "Healthcare",
    "Education",
    "Finance",
    "Hospitality",
    "Retail",
    "Manufacturing",
    "Transportation",
    "Energy",
    "Mining",
  ];

  // Employment types
  const employmentTypes = ["All", "Full-time", "Part-time", "Casual"];

  // Salary ranges in $10k increments
  const salaryRanges = [
    "All",
    "$0 - $10,000",
    "$10,000 - $20,000",
    "$20,000 - $30,000",
    "$30,000 - $40,000",
    "$40,000 - $50,000",
    "$50,000 - $60,000",
    "$60,000 - $70,000",
    "$70,000 - $80,000",
    "$80,000 - $90,000",
    "$90,000 - $100,000",
    "$100,000+",
  ];

  const locations = ["All", "Sydney, NSW", "Melbourne, VIC", "Brisbane, QLD", "Perth, WA", "Adelaide, SA", "Canberra, ACT", "Remote"];

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        status: "active",
      });

      if (selectedIndustry !== "All") {
        params.append("industry", selectedIndustry);
      }
      if (selectedLocation !== "All") {
        params.append("location", selectedLocation);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const data = await apiClient.get<{ jobs: Job[]; pagination: { page: number; limit: number; total: number; pages: number } }>(
        `/api/jobs?${params.toString()}`
      );
      setJobs(data.jobs);
    } catch (error: unknown) {
      console.error("Error fetching jobs:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load jobs";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, selectedIndustry, selectedType, selectedLocation, searchTerm, toast]);

  const formatSalary = (salary?: { min?: number; max?: number; currency?: string; period?: string }) => {
    if (!salary || (!salary.min && !salary.max)) return "Salary not specified";
    // const currency = salary.currency || "AUD"; // Removed unused variable
    const period = salary.period === "year" ? "year" : salary.period === "month" ? "month" : "hour";
    if (salary.min && salary.max) {
      return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}/${period}`;
    }
    if (salary.min) {
      return `From $${salary.min.toLocaleString()}/${period}`;
    }
    return `Up to $${salary.max?.toLocaleString()}/${period}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const filteredJobs = jobs.filter((job) => {
    // Filter by employment type
    if (selectedType !== "All") {
      const jobType = job.type.toLowerCase().replace("-", " ").replace("_", " ");
      const selectedTypeLower = selectedType.toLowerCase();
      // Handle different variations: "full-time", "full time", "fulltime", "casual"
      const normalizedJobType = jobType.replace(/\s+/g, "");
      const normalizedSelectedType = selectedTypeLower.replace(/\s+/g, "");
      // Check multiple variations
      const jobTypeVariations = [
        job.type.toLowerCase(),
        job.type.toLowerCase().replace("-", " "),
        normalizedJobType
      ];
      const selectedTypeVariations = [
        selectedTypeLower,
        selectedTypeLower.replace(" ", "-"),
        normalizedSelectedType
      ];
      
      const matches = jobTypeVariations.some(jt => 
        selectedTypeVariations.some(st => jt === st)
      );
      
      if (!matches) {
        return false;
      }
    }

    // Filter by salary range
    if (selectedSalaryMin !== "All" || selectedSalaryMax !== "All") {
      const jobSalary = job.salary;
      if (!jobSalary || (!jobSalary.min && !jobSalary.max)) {
        // If no salary specified and we're filtering by salary, exclude it
        return false;
      } else {
        const jobMin = jobSalary.min || 0;
        const jobMax = jobSalary.max || jobMin;

        if (selectedSalaryMin !== "All") {
          const minRangeStr = selectedSalaryMin.split(" - ")[0].replace("$", "").replace(/,/g, "");
          const minRange = parseInt(minRangeStr);
          if (jobMax < minRange) return false;
        }

        if (selectedSalaryMax !== "All") {
          if (selectedSalaryMax === "$100,000+") {
            if (jobMin < 100000) return false;
          } else {
            const maxRangeStr = selectedSalaryMax.split(" - ")[1].replace("$", "").replace(/,/g, "");
            const maxRange = parseInt(maxRangeStr);
            if (jobMin > maxRange) return false;
          }
        }
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Dream Job in Australia
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8">
            Discover verified opportunities across skilled trades and professions
          </p>

          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for specific jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Industry Filter */}
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-medium text-gray-700">Industry</Label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger id="industry" className="h-12">
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Employment Type Filter */}
                <div className="space-y-2">
                  <Label htmlFor="employmentType" className="text-sm font-medium text-gray-700">Employment Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger id="employmentType" className="h-12">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary Range Min */}
                <div className="space-y-2">
                  <Label htmlFor="salaryMin" className="text-sm font-medium text-gray-700">Salary Range (Min)</Label>
                  <Select value={selectedSalaryMin} onValueChange={setSelectedSalaryMin}>
                    <SelectTrigger id="salaryMin" className="h-12">
                      <SelectValue placeholder="Min Salary" />
                    </SelectTrigger>
                    <SelectContent>
                      {salaryRanges.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary Range Max */}
                <div className="space-y-2">
                  <Label htmlFor="salaryMax" className="text-sm font-medium text-gray-700">Salary Range (Max)</Label>
                  <Select value={selectedSalaryMax} onValueChange={setSelectedSalaryMax}>
                    <SelectTrigger id="salaryMax" className="h-12">
                      <SelectValue placeholder="Max Salary" />
                    </SelectTrigger>
                    <SelectContent>
                      {salaryRanges.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Jobs List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No jobs found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map((job) => (
                  <Card key={job._id} className="bg-white overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
                    <Link href={`/jobs/${job._id}`}>
                      <div className="relative h-48 bg-gradient-to-br from-[#B260E6] to-[#ED84A5]">
                        {job.image ? (
                          <Image
                            src={job.image}
                            alt={job.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-white text-4xl">
                            <Briefcase className="h-16 w-16" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                        <p className="text-gray-600 mb-4">{job.company.name}</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {job.location}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {formatDate(job.createdAt)}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="h-4 w-4 mr-2" />
                            {formatSalary(job.salary)}
                          </div>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5]">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
