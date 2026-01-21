"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Video, ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/useToast";

interface TrainingProgram {
  _id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  format: string;
  category: string;
  featuredImage?: string;
  free: boolean;
  price?: number;
}

export default function AllTrainingProgramsPage() {
  const router = useRouter();
  const toast = useToast();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [selectedLevel, setSelectedLevel] = useState("All");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await apiClient.get("/api/auth/profile");
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ limit: "50" });
        if (selectedLevel !== "All") {
          params.append("level", selectedLevel);
        }
        const response = await apiClient.get<{ programs: TrainingProgram[] }>(`/api/training-programs?${params.toString()}`);
        setPrograms(response.programs || []);
      } catch (error) {
        console.error("Error fetching programs:", error);
        toast.error("Failed to load training programs");
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, [selectedLevel, toast]);

  const handleEnroll = (programId: string) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/user/training-programs/${programId}/enroll`);
      toast.info("Please log in to enroll in training programs");
      return;
    }
    router.push(`/user/training-programs/${programId}/enroll`);
  };

  const levels = ["All", "Beginner", "Intermediate", "Advanced", "All Levels"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-2xl mb-6">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Training <span className="text-[#B260E6]">Programs</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse all our skills training programs and enhance your career
          </p>
        </div>

        {/* Level Filter */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {levels.map((level) => (
            <Button
              key={level}
              variant={selectedLevel === level ? "default" : "outline"}
              onClick={() => setSelectedLevel(level)}
              className={selectedLevel === level 
                ? "bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white border-0" 
                : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"}
            >
              {level}
            </Button>
          ))}
        </div>

        {/* Programs Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading training programs...</p>
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No training programs found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Card key={program._id} className="bg-white hover:shadow-xl transition-shadow duration-300 border border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                    <div className="w-10 h-10 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-lg flex items-center justify-center">
                      <Video className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{program.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {program.duration}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {program.level}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {program.format}
                    </span>
                    {program.free ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Free
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        ${program.price}
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleEnroll(program._id)}
                    className="w-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white"
                  >
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
