"use client";

import { useState, useEffect, useCallback } from "react";
import DataTable from "@/components/admin/DataTable";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { Building2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Company {
  _id: string;
  name: string;
  industry: string;
  location: string;
  description: string;
  website?: string;
  employees?: string;
  verified: boolean;
  openJobs: number;
  rating?: number;
  established?: number;
}

export default function CompaniesPage() {
  const toast = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    location: "",
    description: "",
    website: "",
    employees: "",
    verified: false,
    established: "",
  });

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<{ companies: Company[]; pagination: unknown }>(
        "/api/companies?limit=100"
      );
      setCompanies(data.companies);
    } catch (error) {
      if (error instanceof Error) {
        const message = error instanceof Error ? error.message : "Failed to load companies";
        toast.error(message);
      } else {
        toast.error("Failed to load companies");
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingCompany(null);
    setFormData({
      name: "",
      industry: "",
      location: "",
      description: "",
      website: "",
      employees: "",
      verified: false,
      established: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (company: Company) => {
    setIsEditMode(true);
    setEditingCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry,
      location: company.location,
      description: company.description,
      website: company.website || "",
      employees: company.employees || "",
      verified: company.verified,
      established: company.established?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (company: Company) => {
    if (!confirm(`Are you sure you want to delete "${company.name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/api/companies/${company._id}`);
      toast.success("Company deleted successfully");
      fetchCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
      const message = error instanceof Error ? error.message : "Failed to delete company";
      toast.error(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        industry: formData.industry,
        location: formData.location,
        description: formData.description,
        verified: formData.verified,
      };

      if (formData.website) payload.website = formData.website;
      if (formData.employees) payload.employees = formData.employees;
      if (formData.established) payload.established = parseInt(formData.established);

      if (isEditMode && editingCompany) {
        await apiClient.put(`/api/companies/${editingCompany._id}`, payload);
        toast.success("Company updated successfully");
      } else {
        await apiClient.post("/api/companies", payload);
        toast.success("Company created successfully");
      }

      setIsDialogOpen(false);
      fetchCompanies();
    } catch (error) {
      console.error("Error saving company:", error);
      const message = error instanceof Error ? error.message : "Failed to save company";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between pb-2"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Companies
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage all registered companies and their verification status.
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </motion.div>

      {/* Companies Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading companies...</p>
        </div>
      ) : (
        <DataTable
          data={companies as unknown as Record<string, unknown>[]}
          columns={[
            {
              key: "name",
              label: "Company Name",
              render: (value) => (
                <span className="font-medium text-foreground">
                  {String(value)}
                </span>
              ),
            },
            {
              key: "industry",
              label: "Industry",
              render: (value) => <Badge variant="outline">{String(value)}</Badge>,
            },
            {
              key: "location",
              label: "Location",
            },
            {
              key: "openJobs",
              label: "Total Jobs",
              render: (value) => (
                <span className="font-medium">{String(value)} posted</span>
              ),
            },
            {
              key: "verified",
              label: "Status",
              render: (value) => {
                return (
                  <Badge variant={value ? "default" : "secondary"}>
                    {value ? "Verified" : "Pending"}
                  </Badge>
                );
              },
            },
          ]}
          searchable={true}
          searchPlaceholder="Search companies..."
          onEdit={(company) => handleEdit(company as unknown as Company)}
          onDelete={(company) => handleDelete(company as unknown as Company)}
          actions={true}
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Company" : "Add New Company"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the company details below."
                : "Create a new company. Fill in all the details below."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., TechCorp"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Sydney, NSW"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Company description..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="employees">Employees</Label>
                  <Input
                    id="employees"
                    placeholder="e.g., 50-100"
                    value={formData.employees}
                    onChange={(e) =>
                      setFormData({ ...formData, employees: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="established">Established Year</Label>
                  <Input
                    id="established"
                    type="number"
                    placeholder="e.g., 2020"
                    value={formData.established}
                    onChange={(e) =>
                      setFormData({ ...formData, established: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="verified"
                    checked={formData.verified}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, verified: checked as boolean })
                    }
                  />
                  <Label htmlFor="verified" className="cursor-pointer">
                    Verified Company
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl transition-transform duration-200 hover:scale-[1.02]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <Building2 className="mr-2 h-4 w-4" />
                {saving
                  ? "Saving..."
                  : isEditMode
                  ? "Update Company"
                  : "Create Company"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
