"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";

import { Shield } from "lucide-react";
import { Wrench,  
  Hammer,  
  Plug,  
  Paintbrush,  
  Truck,  
  Utensils,  
  Users,  
  Scissors,  
  Cog, 
  Search, 
  MapPin, 
  Filter, 
  Clock, 
  ArrowRight,
  DollarSign,
  Briefcase
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page] = useState(1); // Page state for future pagination

  // Job categories with Australian context
  const jobCategories = [
    { id: 0, title: "All", icon: <Users className="h-6 w-6 text-white" />, image: "https://source.unsplash.com/800x600/?australian-workers,team" },
    { id: 1, title: "Construction & Masonry", icon: <Hammer className="h-6 w-6 text-white" />, image: "https://source.unsplash.com/800x600/?australian-construction,building" },
    { id: 2, title: "Electrical & Wiring", icon: <Plug className="h-6 w-6 text-white" />, image: "https://source.unsplash.com/800x600/?australian-electrician,electrical" },
    { id: 3, title: "Plumbing & Fittings", icon: <Wrench className="h-6 w-6 text-white" />, image: "https://source.unsplash.com/800x600/?australian-plumber,plumbing" },
    { id: 4, title: "Painting & Finishing", icon: <Paintbrush className="h-6 w-6 text-white" />, image: "https://source.unsplash.com/800x600/?australian-painter,painting" },
    { id: 5, title: "Driving & Logistics", icon: <Truck className="h-6 w-6 text-white" />, image: "https://source.unsplash.com/800x600/?australian-truck,logistics" },
    { id: 6, title: "Culinary & Kitchen Staff", icon: <Utensils className="h-6 w-6 text-white" />, image: "https://source.unsplash.com/800x600/?australian-chef,kitchen" },
    { id: 7, title: "Cleaning & Maintenance", icon: <Users className="h-6 w-6 text-white" />, image: "https://source.unsplash.com/800x600/?australian-cleaning,maintenance" },
    { id: 8, title: "Tailoring & Textile", icon: <Scissors className="h-6 w-6 text-white" />, image: "https://source.unsplash.com/800x600/?australian-tailor,textile" },
    { id: 9, title: "Security & Supervision", icon: <Shield className="h-6 w-6 text-white" />, image: "https://source.unsplash.com/800x600/?australian-security,supervisor" },
    { id: 10, title: "Machine & Auto Mechanics", icon: <Cog className="h-6 w-6 text-white" />, image: "https://source.unsplash.com/800x600/?australian-mechanic,automotive" },
  ];

  const locations = ["All", "Sydney, NSW", "Melbourne, VIC", "Brisbane, QLD", "Perth, WA", "Adelaide, SA", "Canberra, ACT"];

  const featuredJobs = [
    {
      title: "Experienced Plumber",
      company: "AquaFlow Services",
      location: "Sydney, NSW",
      salary: "$75,000 - $95,000/year",
      type: "Full-time",
      posted: "2 days ago",
      image: "/images/jobs/plumber.PNG",
    },
    {
      title: "Commercial Electrician",
      company: "BrightVolt Ltd.",
      location: "Melbourne, VIC",
      salary: "$85,000 - $110,000/year",
      type: "Full-time",
      posted: "1 day ago",
      image: "/images/jobs/electrician.PNG",
    },
    {
      title: "Construction Site Manager",
      company: "UrbanBuild Co.",
      location: "Brisbane, QLD",
      salary: "$120,000 - $150,000/year",
      type: "Full-time",
      posted: "3 days ago",
      image: "/images/jobs/construction.PNG",
    },
    {
      title: "Heavy Vehicle Driver Logistics",
      company: "TransRoad Logistics",
      location: "Perth, WA",
      salary: "$65,000 - $80,000/year",
      type: "Full-time",
      posted: "4 days ago",
      image: "/images/jobs/driver.PNG",
    },
    {
      title: "Senior Painter / Decorator",
      company: "ColourFinish Pty Ltd",
      location: "Adelaide, SA",
      salary: "$55,000 - $70,000/year",
      type: "Full-time",
      posted: "5 days ago",
      image: "/images/jobs/painter.PNG",
    },
    {
      title: "Chef de Partie Hotel Kitchen",
      company: "GrandHarbour Hotel & Resorts",
      location: "Sydney, NSW",
      salary: "$60,000 - $75,000/year",
      type: "Full-time",
      posted: "2 days ago",
      image: "/images/jobs/chef.PNG",
    },
  ];

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        status: "active",
      });

      if (selectedCategory !== "All") {
        params.append("industry", selectedCategory);
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
  }, [page, selectedCategory, selectedType, selectedLocation, searchTerm, toast]);

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
    if (selectedType !== "All" && job.type !== selectedType.toLowerCase().replace("-", "")) {
      return false;
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
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search jobs, companies, locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B260E6] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B260E6]"
                >
                  <option value="All">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                </select>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B260E6]"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {jobCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.title)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.title
                    ? "bg-[#B260E6] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.icon}
                <span>{category.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Job Openings */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured <span className="text-[#B260E6]">Job Openings</span>
              </h2>
              <p className="text-lg text-gray-600">
                Latest opportunities across Australian cities and regions
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={job.image}
                    alt={job.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {job.posted}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 font-medium">{job.company}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-[#ED84A5]" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-[#ED84A5]" />
                      {job.salary}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-[#ED84A5]" />
                      {job.type}
                    </div>
                  </div>

                  <Link href="/auth/register">
                    <Button className="w-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white rounded-full">
                      Apply Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section className="py-12 bg-gray-50">
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
                  <Card key={job._id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
