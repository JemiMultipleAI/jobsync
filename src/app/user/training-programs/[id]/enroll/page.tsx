"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Video, Clock, GraduationCap } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/useToast";

interface TrainingProgram {
  _id: string;
  title: string;
  description: string;
  content?: string;
  duration: string;
  level: string;
  format: string;
  category: string;
  badgeName?: string;
  badgeIcon?: string;
  free: boolean;
  price?: number;
}

export default function EnrollPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        const [programRes, profileRes] = await Promise.all([
          apiClient.get<{ program: TrainingProgram }>(`/api/training-programs/${params.id}`),
          apiClient.get<{ user: { completedTrainingPrograms?: string[] } }>("/api/auth/profile"),
        ]);

        setProgram(programRes.program);
        const completedIds = profileRes.user.completedTrainingPrograms || [];
        setIsEnrolled(completedIds.includes(programRes.program._id));
      } catch (error) {
        console.error("Error fetching program:", error);
        toast.error("Failed to load training program");
        router.push("/user/training-programs");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchProgram();
    }
  }, [params.id, router, toast]);

  const handleEnroll = async () => {
    try {
      setIsEnrolling(true);
      await apiClient.post(`/api/training-programs/${params.id}/enroll`);
      toast.success("Successfully enrolled in training program!");
      setIsEnrolled(true);
      router.push("/user/training-programs");
    } catch (error) {
      toast.error("Failed to enroll in program");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!program) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{program.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{program.description}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-xl flex items-center justify-center ml-4">
              <Video className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-[#B260E6] mb-2" />
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-semibold">{program.duration}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <GraduationCap className="h-5 w-5 text-[#ED84A5] mb-2" />
              <p className="text-sm text-gray-600">Level</p>
              <p className="font-semibold">{program.level}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Video className="h-5 w-5 text-[#B260E6] mb-2" />
              <p className="text-sm text-gray-600">Format</p>
              <p className="font-semibold">{program.format}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Price</p>
              <p className="font-semibold">{program.free ? "Free" : `$${program.price}`}</p>
            </div>
          </div>

          {program.content && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Program Content</h3>
              <div className="text-gray-700 whitespace-pre-wrap">{program.content}</div>
            </div>
          )}

          {program.badgeName && (
            <div className="mb-6 p-4 bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10 rounded-lg border border-[#B260E6]/20">
              <div className="flex items-center">
                {program.badgeIcon && (
                  <img src={program.badgeIcon} alt="Badge" className="h-8 w-8 mr-3" />
                )}
                <div>
                  <p className="text-sm text-gray-600">Earn Badge</p>
                  <p className="font-semibold text-[#B260E6]">{program.badgeName}</p>
                </div>
              </div>
            </div>
          )}

          {isEnrolled ? (
            <div className="space-y-4">
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white" disabled>
                <CheckCircle className="mr-2 h-4 w-4" />
                Already Enrolled
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/user/training-programs")}
              >
                View My Programs
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="w-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white py-6 text-lg"
            >
              {isEnrolling ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enrolling...
                </>
              ) : (
                <>
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Enroll in Program
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
