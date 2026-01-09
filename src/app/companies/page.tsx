"use client"

import React, { useMemo, useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/lib/hooks/useToast"
import { apiClient } from "@/lib/api/client"
import Link from "next/link"
import {
  MapPin,
  Search,
  ArrowRight,
  Star,
  Heart,
  Filter,
  Factory,
  ClipboardList,
  UserCheck2,
  BadgeCheck,
  Building2,
  Users,
} from "lucide-react"

interface Company {
  _id: string
  name: string
  industry: string
  location: string
  employees?: string
  openJobs: number
  description: string
  logo?: string
  coverImage?: string
  rating?: number
  verified: boolean
  established?: number
}

export default function CompaniesPage(): React.JSX.Element {
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All")
  const [favoriteCompanies, setFavoriteCompanies] = useState<string[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalJobs: 0,
    totalCandidates: 0,
    successRate: 95,
  })

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: "1",
        limit: "20",
      })

      if (selectedIndustry !== "All") {
        params.append("industry", selectedIndustry)
      }
      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const data = await apiClient.get<{ companies: Company[]; pagination: { page: number; limit: number; total: number; pages: number } }>(
        `/api/companies?${params.toString()}`
      )
      setCompanies(data.companies)
    } catch (error) {
      console.error("Error fetching companies:", error)
      const message = error instanceof Error ? error.message : "Failed to load companies";
      toast.error(message);
    } finally {
      setLoading(false)
    }
  }, [selectedIndustry, searchTerm, toast]);

  useEffect(() => {
    fetchCompanies()
    fetchStats()
  }, [fetchCompanies])

  const fetchStats = async () => {
    try {
      // Fetch stats from APIs
      const [companiesData, jobsData] = await Promise.all([
        apiClient.get<{ pagination: { total: number } }>("/api/companies?limit=1"),
        apiClient.get<{ pagination: { total: number } }>("/api/jobs?limit=1&status=active"),
      ])
      setStats({
        totalCompanies: companiesData.pagination.total || 0,
        totalJobs: jobsData.pagination.total || 0,
        totalCandidates: 0, // Would need user count API
        successRate: 95,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const toggleFavorite = (companyId: string) => {
    if (favoriteCompanies.includes(companyId)) {
      setFavoriteCompanies((prev) => prev.filter((id) => id !== companyId))
      toast.info("Company removed from favorites")
    } else {
      setFavoriteCompanies((prev) => [...prev, companyId])
      toast.success("Company added to favorites")
    }
  }

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch =
        q === "" ||
        company.name.toLowerCase().includes(q) ||
        company.industry.toLowerCase().includes(q) ||
        company.location.toLowerCase().includes(q)
      const matchesIndustry = selectedIndustry === "All" || company.industry === selectedIndustry
      return matchesSearch && matchesIndustry
    })
  }, [companies, searchTerm, selectedIndustry])

  const industries = [
    "All",
    "Construction & Masonry",
    "Electrical & Wiring",
    "Plumbing & Fittings",
    "Painting & Finishing",
    "Driving & Logistics",
    "Culinary & Kitchen Staff",
    "Cleaning & Maintenance",
    "Tailoring & Textile",
    "Security & Supervision",
  ]

  const statsItems = [
    { number: `${stats.totalCompanies.toLocaleString()}+`, label: "Australian Companies", icon: Factory, bg: "bg-gradient-to-br from-[#B260E6] to-[#ED84A5]" },
    { number: `${stats.totalJobs.toLocaleString()}+`, label: "Active Jobs", icon: ClipboardList, bg: "bg-gradient-to-br from-[#ED84A5] to-[#FF9F7C]" },
    { number: `${stats.totalCandidates.toLocaleString()}+`, label: "Candidates", icon: UserCheck2, bg: "bg-gradient-to-br from-[#6EC8FF] to-[#B260E6]" },
    { number: `${stats.successRate}%`, label: "Success Rate", icon: BadgeCheck, bg: "bg-gradient-to-br from-[#8EE078] to-[#4CCB9A]" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#B260E6] to-[#ED84A5] text-white py-28 overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Australia&apos;s{" "}
            <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Top Employers</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with leading Australian companies that value skilled trades and professional growth
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-200 h-5 w-5" />
              <Input
                placeholder="Search companies by name, industry or location..."
                className="pl-12 h-14 text-lg rounded-xl border-0 focus:ring-2 focus:ring-white bg-white/20 backdrop-blur-sm text-white placeholder-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search companies"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsItems.map((s, idx) => {
              const Icon = s.icon
              return (
                <div key={idx} className="p-5 bg-white rounded-2xl shadow-lg text-center hover:shadow-xl transition">
                  <div className={`mx-auto w-14 h-14 flex items-center justify-center text-3xl rounded-2xl text-white shadow-md ${s.bg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-gray-800">{s.number}</h3>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Featured <span className="text-[#B260E6]">Companies</span>
            </h2>
            <p className="text-gray-600 text-lg">
              {loading ? "Loading..." : `Discover ${filteredCompanies.length} amazing companies hiring across Australia`}
            </p>
          </div>

          <div className="flex gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <select
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B260E6] outline-none appearance-none bg-white w-full sm:w-64"
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                aria-label="Filter by industry"
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading companies...</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No companies found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company) => (
              <Card key={company._id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative h-48 bg-gradient-to-br from-[#B260E6] to-[#ED84A5]">
                  {company.coverImage ? (
                    <Image
                      src={company.coverImage}
                      alt={company.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      <Building2 className="h-16 w-16" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`rounded-full bg-white/90 hover:bg-white ${
                        favoriteCompanies.includes(company._id) ? "text-[#ED84A5]" : "text-gray-400"
                      }`}
                      onClick={() => toggleFavorite(company._id)}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          favoriteCompanies.includes(company._id) ? "fill-current" : ""
                        }`}
                      />
                    </Button>
                  </div>
                  {company.verified && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500 text-white">
                        <BadgeCheck className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1 group-hover:text-[#B260E6] transition-colors">
                        {company.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{company.location}</span>
                      </div>
                      {company.rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(company.rating!) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">{company.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {company.logo && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={company.logo}
                          alt={`${company.name} logo`}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{company.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">{company.industry}</Badge>
                    <div className="text-sm text-gray-600">
                      <Users className="h-4 w-4 inline mr-1" />
                      {company.employees || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-semibold text-[#B260E6]">{company.openJobs}</span>{" "}
                      <span className="text-gray-600">open positions</span>
                    </div>
                    <Link href={`/companies/${company._id}`}>
                      <Button className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]">
                        View Jobs
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
