"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardCard from "@/components/shared/DashboardCard";
import DataTable from "@/components/shared/DataTable";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
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
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: {
      name: string;
    };
    location: string;
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
  };
  status: string;
  appliedAt: string;
}

// Status filters will be translated in the component

const statusMap: Record<string, string> = {
  pending: "Pending",
  "under-review": "Under Review",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  accepted: "Accepted",
};

export default function ApplicationsPage() {
  const toast = useToast();
  const { t } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredData, setFilteredData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedFilter !== "All") {
        params.append("status", selectedFilter);
      }

      const response = await apiClient.get<{
        applications: Application[];
        pagination: { page: number; limit: number; total: number; pages: number };
      }>(`/api/applications?${params.toString()}`);

      // API returns { applications: [...], pagination: {...} }
      if (response && 'applications' in response) {
        setApplications(response.applications || []);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      const message = error instanceof Error ? error.message : "Failed to load applications";
      toast.error(message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (selectedFilter === "All") {
      setFilteredData(applications);
    } else {
      const filterStatus = selectedFilter.toLowerCase().replace(" ", "-");
      setFilteredData(
        applications.filter((app) => app.status === filterStatus)
      );
    }
  }, [applications, selectedFilter]);

  const handleFilter = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleWithdraw = async () => {
    if (!selectedApplication) return;

    try {
      await apiClient.delete<{ message?: string }>(
        `/api/applications/${selectedApplication._id}`
      );
      toast.success(t("applications.withdrawn"));
      setWithdrawDialogOpen(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error) {
      console.error("Error withdrawing application:", error);
      const message = error instanceof Error ? error.message : "Failed to withdraw application";
      toast.error(message);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const normalizedStatus = statusMap[status] || status;
    const variants: Record<
      string,
      "default" | "secondary" | "outline" | "destructive"
    > = {
      Pending: "secondary",
      "Under Review": "default",
      Shortlisted: "default",
      Rejected: "destructive",
      Accepted: "default",
    };
    return variants[normalizedStatus] || "secondary";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatSalary = (salary?: { min?: number; max?: number; currency?: string }) => {
    if (!salary || (!salary.min && !salary.max)) return t("applications.notSpecified");
    const currency = salary.currency || "AUD";
    if (salary.min && salary.max) {
      return `${currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
    }
    if (salary.min) return `${currency} ${salary.min.toLocaleString()}+`;
    if (salary.max) return `Up to ${currency} ${salary.max.toLocaleString()}`;
    return "Not specified";
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
            <FileText className="h-6 w-6 text-[#B260E6]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("applications.title")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("applications.description")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[t("applications.all"), t("applications.pending"), t("applications.underReview"), t("applications.shortlisted"), t("applications.rejected"), t("applications.accepted")].map((filter) => {
          const filterKey = filter === t("applications.all") ? "All" : 
                           filter === t("applications.pending") ? "Pending" :
                           filter === t("applications.underReview") ? "Under Review" :
                           filter === t("applications.shortlisted") ? "Shortlisted" :
                           filter === t("applications.rejected") ? "Rejected" : "Accepted";
          const count =
            filterKey === "All"
              ? applications.length
              : applications.filter(
                  (app) => statusMap[app.status] === filterKey
                ).length;
          return (
            <Button
              key={filter}
              variant={selectedFilter === filterKey ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilter(filterKey)}
              className={
                selectedFilter === filterKey
                  ? "bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]"
                  : ""
              }
            >
              {filter}
              {filterKey !== "All" && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-background/50 text-xs"
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t("applications.loading")}</p>
        </div>
      ) : (
        <DashboardCard
          title={`${filteredData.length} ${filteredData.length !== 1 ? t("applications.countPlural") : t("applications.count")}`}
          description={t("applications.history")}
        >
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {selectedFilter === "All"
                  ? t("applications.noApplications")
                  : `${t("applications.noFiltered")} ${selectedFilter.toLowerCase()} ${t("applications.applications")}`}
              </p>
            </div>
          ) : (
            <DataTable
              data={filteredData.map((app) => ({
                _id: app._id,
                jobTitle: app.job.title,
                company: app.job.company.name,
                location: app.job.location,
                appliedDate: app.appliedAt,
                status: statusMap[app.status] || app.status,
                salary: formatSalary(app.job.salary),
              }))}
              columns={[
                {
                  key: "jobTitle",
                  label: t("applications.jobTitle"),
                  render: (value, row) => (
                    <div>
                      <div className="font-medium">{String(value)}</div>
                      <div className="text-xs text-muted-foreground">
                        {(row as { location?: string }).location}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "company",
                  label: t("applications.company"),
                  render: (value) => (
                    <span className="font-medium">{String(value)}</span>
                  ),
                },
                {
                  key: "appliedDate",
                  label: t("applications.appliedDate"),
                  render: (value) => formatDate(value as string),
                },
                {
                  key: "status",
                  label: t("applications.status"),
                  render: (value) => (
                    <Badge variant={getStatusBadgeVariant(value as string)}>
                      {String(value)}
                    </Badge>
                  ),
                },
                {
                  key: "salary",
                  label: t("applications.salary"),
                },
              ]}
              searchable={true}
              searchPlaceholder={t("applications.search")}
              actions={true}
              editLabel={t("applications.view")}
              onEdit={(row) => {
                // Handle view action - could navigate to job detail
                console.log("View application", row);
              }}
              onDelete={(row) => {
                setSelectedApplication(
                  applications.find((app) => app._id === row._id) || null
                );
                setWithdrawDialogOpen(true);
              }}
            />
          )}
        </DashboardCard>
      )}

      {/* Withdraw Confirmation Dialog */}
      <AlertDialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("applications.withdrawTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("applications.withdrawDesc")}{" "}
              <strong>{selectedApplication?.job.title}</strong>? {t("applications.withdrawWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdraw}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("applications.withdraw")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
