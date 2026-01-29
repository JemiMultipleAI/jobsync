"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/shared/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/lib/hooks/useToast";
import { GraduationCap, Video, CheckCircle, Clock, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TrainingProgram {
  _id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  format: string;
  category: string;
  badgeName?: string;
  badgeIcon?: string;
  free: boolean;
  price?: number;
}

interface UserEnrollment {
  programId: string;
  enrolled: boolean;
  completed: boolean;
}

export default function UserTrainingProgramsPage() {
  const router = useRouter();
  const toast = useToast();
  const [allPrograms, setAllPrograms] = useState<TrainingProgram[]>([]);
  const [enrolledPrograms, setEnrolledPrograms] = useState<TrainingProgram[]>([]);
  const [completedPrograms, setCompletedPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const [programsRes, profileRes] = await Promise.all([
        apiClient.get<{ programs: TrainingProgram[] }>("/api/training-programs?limit=100"),
        apiClient.get<{ user: { enrolledTrainingPrograms?: string[]; completedTrainingPrograms?: string[]; badges?: Array<{ trainingProgramId: string }> } }>("/api/auth/profile"),
      ]);

      const allPrograms = programsRes.programs || [];
      setAllPrograms(allPrograms);

      const enrolledIds = profileRes.user.enrolledTrainingPrograms || [];
      const completedIds = profileRes.user.completedTrainingPrograms || [];
      
      const completed = allPrograms.filter((p) => completedIds.includes(p._id));
      setCompletedPrograms(completed);

      // Get enrolled programs (enrolled but not completed)
      const enrolled = allPrograms.filter(
        (p) => enrolledIds.includes(p._id) && !completedIds.includes(p._id)
      );
      setEnrolledPrograms(enrolled);
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast.error("Failed to load training programs");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleEnroll = async (programId: string) => {
    try {
      await apiClient.post(`/api/training-programs/${programId}/enroll`);
      toast.success("Successfully enrolled in training program");
      fetchPrograms();
    } catch (error) {
      toast.error("Failed to enroll in program");
    }
  };

  const handleComplete = async (programId: string) => {
    try {
      const response = await apiClient.post<{ badge?: { name: string; icon: string } }>(
        `/api/training-programs/${programId}/complete`
      );
      if (response.badge) {
        toast.success(`Congratulations! You earned the ${response.badge.name} badge!`);
      } else {
        toast.success("Training program completed successfully!");
      }
      fetchPrograms();
    } catch (error) {
      toast.error("Failed to complete program");
    }
  };

  const filteredPrograms = allPrograms.filter((program) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      program.title.toLowerCase().includes(query) ||
      program.description.toLowerCase().includes(query) ||
      program.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Skills Training Programs</h1>
        <p className="text-muted-foreground mt-1">
          Browse, enroll, and complete training programs to earn badges for your profile
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Programs</TabsTrigger>
          <TabsTrigger value="enrolled">My Enrollments</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <DashboardCard title="Search Programs" description="Find training programs by name, description, or category">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </DashboardCard>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading programs...</p>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <DashboardCard title="No Programs Found" description="No training programs match your search">
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No programs available.</p>
              </div>
            </DashboardCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrograms.map((program) => {
                const isCompleted = completedPrograms.some((p) => p._id === program._id);
                const isEnrolled = enrolledPrograms.some((p) => p._id === program._id);

                return (
                  <Card key={program._id} className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                        <div className="w-10 h-10 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-lg flex items-center justify-center">
                          <Video className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-3">{program.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">{program.duration}</Badge>
                        <Badge variant="secondary">{program.level}</Badge>
                        <Badge variant="secondary">{program.format}</Badge>
                        {program.free ? (
                          <Badge className="bg-green-500">Free</Badge>
                        ) : (
                          <Badge className="bg-blue-500">${program.price}</Badge>
                        )}
                      </div>
                      {isCompleted ? (
                        <div className="space-y-2">
                          <Button className="w-full bg-green-500 hover:bg-green-600 text-white" disabled>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Completed
                          </Button>
                          {program.badgeName && (
                            <Badge className="w-full justify-center bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white">
                              Badge: {program.badgeName}
                            </Badge>
                          )}
                        </div>
                      ) : isEnrolled ? (
                        <Button
                          onClick={() => handleComplete(program._id)}
                          className="w-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Complete
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleEnroll(program._id)}
                          className="w-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white"
                        >
                          Enroll Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-6">
          {enrolledPrograms.length === 0 ? (
            <DashboardCard title="No Enrollments" description="You haven't enrolled in any programs yet">
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Enroll in programs to see them here.</p>
              </div>
            </DashboardCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledPrograms.map((program) => (
                <Card key={program._id} className="bg-white border border-gray-200 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                    <p className="text-gray-600 mb-4">{program.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">{program.duration}</Badge>
                      <Badge variant="secondary">{program.level}</Badge>
                    </div>
                    <Button
                      onClick={() => handleComplete(program._id)}
                      className="w-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Complete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedPrograms.length === 0 ? (
            <DashboardCard title="No Completed Programs" description="Complete training programs to earn badges">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Complete programs to see them here.</p>
              </div>
            </DashboardCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedPrograms.map((program) => (
                <Card key={program._id} className="bg-white border border-gray-200 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-gray-600 mb-4">{program.description}</p>
                    {program.badgeName && (
                      <Badge className="w-full justify-center mb-4 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white">
                        {program.badgeIcon && <img src={program.badgeIcon} alt="" className="h-4 w-4 mr-2" />}
                        Badge: {program.badgeName}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
