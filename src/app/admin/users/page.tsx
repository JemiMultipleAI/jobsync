"use client";

import { useState, useEffect, useCallback } from "react";
import DataTable from "@/components/admin/DataTable";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, UserPlus, Users } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "employer";
  company?: string | { _id: string; name: string };
  createdAt: string;
  profileCompletion?: number;
}

export default function UsersPage() {
  const toast = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as "user" | "admin" | "employer",
    company: "none",
  });
  const [companies, setCompanies] = useState<Array<{ _id: string; name: string }>>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{
        users: User[];
        pagination: { page: number; limit: number; total: number; pages: number };
      }>("/api/admin/users?limit=100");

      // API returns { users: [...], pagination: {...} }
      if (response && 'users' in response) {
        setUsers(response.users || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      const message = error instanceof Error ? error.message : "Failed to load users";
      toast.error(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoadingCompanies(true);
      const res = await apiClient.get<{ companies: Array<{ _id: string; name: string }> }>(
        "/api/companies?limit=100"
      );
      setCompanies(res.companies || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      const message = error instanceof Error ? error.message : "Failed to load companies";
      toast.error(message);
    } finally {
      setLoadingCompanies(false);
    }
  }, [toast]);

  useEffect(() => {
    if (formData.role === "employer") {
      fetchCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.role]);

  const handleCreate = () => {
    setIsEditMode(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "user",
      company: "none",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setIsEditMode(true);
    setEditingUser(user);
    const companyId = typeof user.company === 'string' 
      ? user.company 
      : user.company?._id || "";
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      company: companyId || "none",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await apiClient.delete<{ message?: string }>(
        `/api/admin/users/${userToDelete._id}`
      );
      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      const message = error instanceof Error ? error.message : "Failed to delete user";
      toast.error(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEditMode && editingUser) {
        // Convert "none" back to empty string for API
        const submitData = {
          ...formData,
          company: formData.company === "none" ? "" : formData.company
        };
        await apiClient.put<{ message?: string; user?: User }>(
          `/api/admin/users/${editingUser._id}`,
          submitData
        );
        toast.success("User updated successfully");
        setIsDialogOpen(false);
        fetchUsers();
      } else {
        // Note: Creating users via admin panel would need a separate endpoint
        // For now, users should register normally
        toast.error("User creation is not available. Users must register themselves.");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      const message = error instanceof Error ? error.message : "Failed to save user";
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
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Users
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage all registered users and their permissions.
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </motion.div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      ) : (
        <DataTable
          data={users as unknown as Record<string, unknown>[]}
          columns={[
            {
              key: "name",
              label: "Name",
              render: (value) => (
                <span className="font-medium">{String(value)}</span>
              ),
            },
            {
              key: "email",
              label: "Email",
            },
            {
              key: "role",
              label: "Role",
              render: (value) => (
                <Badge
                  variant={
                    value === "admin"
                      ? "default"
                      : "outline"
                  }
                >
                  {String(value)}
                </Badge>
              ),
            },
            {
              key: "profileCompletion",
              label: "Profile",
              render: (value) => (
                <span className="text-sm text-muted-foreground">
                  {value ? `${value}%` : "N/A"}
                </span>
              ),
            },
            {
              key: "createdAt",
              label: "Registered",
              render: (value) => new Date(String(value)).toLocaleDateString(),
            },
          ]}
          searchable={true}
          searchPlaceholder="Search users..."
          onEdit={(user) => handleEdit(user as unknown as User)}
          onDelete={(user) => handleDelete(user as unknown as User)}
          actions={true}
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the user details below."
                : "Note: Users should register themselves. This feature is for editing existing users only."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={isEditMode}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "user" | "admin" | "employer") =>
                    setFormData({ ...formData, role: value, company: "none" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.role === "employer" && (
                <div className="grid gap-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Select
                    value={formData.company}
                    onValueChange={(value) =>
                      setFormData({ ...formData, company: value })
                    }
                    disabled={loadingCompanies}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCompanies ? "Loading companies..." : "Select a company"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Link later)</SelectItem>
                      {companies.map((comp) => (
                        <SelectItem key={comp._id} value={comp._id}>
                          {comp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select a company to link this employer to, or leave blank for them to link later.
                  </p>
                </div>
              )}
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
                disabled={saving || !isEditMode}
                className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : isEditMode ? "Update User" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{userToDelete?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
