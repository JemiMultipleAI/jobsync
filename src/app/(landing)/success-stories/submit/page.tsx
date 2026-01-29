"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Trophy, ArrowLeft, Send } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/useToast";

const successStorySchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  story: z.string().min(100, "Story must be at least 100 characters"),
  industry: z.string().min(1, "Please select an industry"),
  isAnonymous: z.boolean(),
});

type SuccessStoryForm = z.infer<typeof successStorySchema>;

export default function SubmitSuccessStoryPage() {
  const router = useRouter();
  const toast = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await apiClient.get("/api/auth/profile");
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
        router.push("/auth/login?redirect=/success-stories/submit");
        toast.error("Please log in to submit your success story");
      }
    };
    checkAuth();
  }, [router, toast]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SuccessStoryForm>({
    resolver: zodResolver(successStorySchema),
    defaultValues: {
      isAnonymous: false,
    },
  });

  const isAnonymous = watch("isAnonymous");

  const onSubmit = async (data: SuccessStoryForm) => {
    if (!isAuthenticated) {
      toast.error("Please log in to submit your success story");
      router.push("/auth/login?redirect=/success-stories/submit");
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, you would submit this to an API endpoint
      // For now, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Success story submitted! We'll review it and publish it soon.");
      router.push("/success-stories");
    } catch (error) {
      toast.error("Failed to submit success story. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-2xl mb-6">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Share Your <span className="text-[#B260E6]">Success Story</span>
            </h1>
            <p className="text-xl text-gray-600">
              Inspire others by sharing how JobSync helped you find your perfect job
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Story Title *
                </label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g., From Mining to Tech: My Career Transformation"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Story */}
              <div>
                <label htmlFor="story" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Story *
                </label>
                <Textarea
                  id="story"
                  {...register("story")}
                  placeholder="Tell us about your journey, how JobSync helped you, and what you achieved..."
                  rows={8}
                  className={errors.story ? "border-red-500" : ""}
                />
                {errors.story && (
                  <p className="mt-1 text-sm text-red-500">{errors.story.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Minimum 100 characters</p>
              </div>

              {/* Industry */}
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  id="industry"
                  {...register("industry")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B260E6] focus:border-transparent"
                >
                  <option value="">Select an industry</option>
                  <option value="Construction">Construction</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Technology">Technology</option>
                  <option value="Mining">Mining</option>
                  <option value="Education">Education</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Energy">Energy</option>
                  <option value="Other">Other</option>
                </select>
                {errors.industry && (
                  <p className="mt-1 text-sm text-red-500">{errors.industry.message}</p>
                )}
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAnonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setValue("isAnonymous", checked === true)}
                />
                <label
                  htmlFor="isAnonymous"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Post anonymously (your name will not be displayed)
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white py-6 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Submit Success Story
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
