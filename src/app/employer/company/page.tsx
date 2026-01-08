"use client";

import { useState, useEffect } from "react";
import DashboardCard from "@/components/admin/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { Building2, Save, Upload } from "lucide-react";
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
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    location: "",
    description: "",
    website: "",
    employees: "",
    established: "",
  });

  useEffect(() => {
    fetchUserCompany();
  }, []);

  const fetchUserCompany = async () => {
    try {
      setLoading(true);
      const profileRes = await apiClient.get<{ user: any }>("/api/auth/profile");
      setUserId(profileRes.user._id);

      const companiesRes = await apiClient.get<{ companies: Company[] }>("/api/companies?limit=100");
      const userCompanies = companiesRes.companies.filter(
        (c: any) => c.createdBy === profileRes.user._id
      );

      if (userCompanies.length > 0) {
        const userCompany = userCompanies[0];
        setCompany(userCompany);
        setFormData({
          name: userCompany.name,
          industry: userCompany.industry,
          location: userCompany.location,
          description: userCompany.description,
          website: userCompany.website || "",
          employees: userCompany.employees || "",
          established: userCompany.established?.toString() || "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching company:", error);
      toast.error(error.message || "Failed to load company");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: any = {
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
    } catch (error: any) {
      console.error("Error saving company:", error);
      toast.error(error.message || "Failed to save company");
    } finally {
      setSaving(false);
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

      {company && company.verified && (
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
                {saving ? "Saving..." : company ? "Update Company" : "Create Company"}
              </Button>
            </div>
          </div>
        </DashboardCard>
      </form>
    </div>
  );
}

