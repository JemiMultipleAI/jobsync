"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardCard from "@/components/admin/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { Save, Link2, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Image from "next/image";

interface Company {
  _id: string;
  name: string;
  industry: string;
  location: string;
  description: string;
  website?: string;
  employees?: string;
  verified: boolean;
  established?: number;
  logo?: string;
  coverImage?: string;
  createdBy: string;
}

export default function EmployerCompanyPage() {
  const toast = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linking, setLinking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [searching, setSearching] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    location: "",
    description: "",
    website: "",
    employees: "",
    established: "",
  });

  const fetchUserCompany = useCallback(async () => {
    try {
      setLoading(true);
      const profileRes = await apiClient.get<{ 
        user: { 
          _id: string; 
          company?: string | { _id: string; name: string } 
        } 
      }>("/api/auth/profile");
      
      // Check if user has a company linked
      if (profileRes.user.company) {
        // Fetch company details
        const companyId = typeof profileRes.user.company === 'string' 
          ? profileRes.user.company 
          : profileRes.user.company._id;
        
        const companyRes = await apiClient.get<{ company: Company }>(
          `/api/companies/${companyId}`
        );
        setCompany(companyRes.company);
        setFormData({
          name: companyRes.company.name,
          industry: companyRes.company.industry,
          location: companyRes.company.location,
          description: companyRes.company.description,
          website: companyRes.company.website || "",
          employees: companyRes.company.employees || "",
          established: companyRes.company.established?.toString() || "",
        });
      }
    } catch (error) {
      console.error("Error fetching company:", error);
      const message = error instanceof Error ? error.message : "Failed to load company";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUserCompany();
  }, [fetchUserCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        industry: formData.industry,
        location: formData.location,
        description: formData.description,
      };

      if (formData.website) payload.website = formData.website;
      if (formData.employees) payload.employees = formData.employees;
      if (formData.established) payload.established = parseInt(formData.established);

      if (company) {
        // Update existing company
        await apiClient.put(`/api/companies/${company._id}`, payload);
        toast.success("Company updated successfully");
      } else {
        // Create new company
        await apiClient.post("/api/companies", payload);
        toast.success("Company created successfully");
      }

      fetchUserCompany();
    } catch (error) {
      console.error("Error saving company:", error);
      const message = error instanceof Error ? error.message : "Failed to save company";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSearchCompanies = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    try {
      setSearching(true);
      const res = await apiClient.get<{ companies: Company[] }>(
        `/api/companies?search=${encodeURIComponent(searchQuery)}&limit=20`
      );
      setAvailableCompanies(res.companies);
    } catch (error) {
      console.error("Error searching companies:", error);
      const message = error instanceof Error ? error.message : "Failed to search companies";
      toast.error(message);
    } finally {
      setSearching(false);
    }
  };

  const handleLinkCompany = async (companyId: string) => {
    try {
      setLinking(true);
      await apiClient.post("/api/employer/company/link", { companyId });
      toast.success("Successfully linked to company");
      fetchUserCompany();
    } catch (error) {
      console.error("Error linking company:", error);
      const message = error instanceof Error ? error.message : "Failed to link company";
      toast.error(message);
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  // If company exists, show management UI
  if (company) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your company information and branding.
          </p>
        </motion.div>

        {company.verified && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                Verified Company
              </Badge>
              <p className="text-sm text-muted-foreground">
                Your company has been verified by our team.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <DashboardCard
            title="Company Information"
            description="Update your company details"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="e.g., Tech Solutions Inc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    required
                    placeholder="e.g., Technology"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                    placeholder="e.g., Sydney, NSW"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employees">Number of Employees</Label>
                  <Select
                    value={formData.employees}
                    onValueChange={(value) =>
                      setFormData({ ...formData, employees: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="501-1000">501-1000</SelectItem>
                      <SelectItem value="1000+">1000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="established">Year Established</Label>
                  <Input
                    id="established"
                    type="number"
                    value={formData.established}
                    onChange={(e) =>
                      setFormData({ ...formData, established: e.target.value })
                    }
                    placeholder="e.g., 2020"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={6}
                  placeholder="Describe your company, its mission, values, and what makes it unique..."
                />
              </div>

              {company?.logo && (
                <div className="space-y-2">
                  <Label>Current Logo</Label>
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                    <Image
                      src={company.logo}
                      alt={company.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Update Company"}
                </Button>
              </div>
            </div>
          </DashboardCard>
        </form>
      </div>
    );
  }

  // If no company, show create/link options
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Company Setup</h1>
        <p className="text-muted-foreground mt-1">
          Create a new company or link to an existing one.
        </p>
      </motion.div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Company
          </TabsTrigger>
          <TabsTrigger value="link" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Link to Existing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <DashboardCard
            title="Create New Company"
            description="Set up your company profile"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="e.g., Tech Solutions Inc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    required
                    placeholder="e.g., Technology"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                    placeholder="e.g., Sydney, NSW"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employees">Number of Employees</Label>
                  <Select
                    value={formData.employees}
                    onValueChange={(value) =>
                      setFormData({ ...formData, employees: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="501-1000">501-1000</SelectItem>
                      <SelectItem value="1000+">1000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="established">Year Established</Label>
                  <Input
                    id="established"
                    type="number"
                    value={formData.established}
                    onChange={(e) =>
                      setFormData({ ...formData, established: e.target.value })
                    }
                    placeholder="e.g., 2020"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={6}
                  placeholder="Describe your company, its mission, values, and what makes it unique..."
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Creating..." : "Create Company"}
                </Button>
              </div>
            </form>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="link" className="mt-6">
          <DashboardCard
            title="Link to Existing Company"
            description="Search and link to an existing company"
          >
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by company name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchCompanies();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleSearchCompanies}
                  disabled={searching}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {searching ? "Searching..." : "Search"}
                </Button>
              </div>

              {availableCompanies.length > 0 && (
                <div className="space-y-2">
                  <Label>Select a company to link:</Label>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableCompanies.map((comp) => (
                      <div
                        key={comp._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{comp.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {comp.industry} • {comp.location}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleLinkCompany(comp._id)}
                          disabled={linking}
                        >
                          <Link2 className="mr-2 h-4 w-4" />
                          Link
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchQuery && availableCompanies.length === 0 && !searching && (
                <p className="text-center text-muted-foreground py-8">
                  No companies found. Try a different search term.
                </p>
              )}
            </div>
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
