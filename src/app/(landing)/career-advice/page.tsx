"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, TrendingUp, Target, ArrowRight, Video, FileText, Users } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/useToast";

interface CareerArticle {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  featuredImage?: string;
}

interface TrainingProgram {
  _id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  format: string;
  category: string;
  featuredImage?: string;
}

export default function CareerAdvicePage() {
  const router = useRouter();
  const toast = useToast();
  const [articles, setArticles] = useState<CareerArticle[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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
    const fetchData = async () => {
      try {
        setLoading(true);
        const [articlesRes, programsRes] = await Promise.all([
          apiClient.get<{ articles: CareerArticle[] }>("/api/career-articles?limit=4"),
          apiClient.get<{ programs: TrainingProgram[] }>("/api/training-programs?limit=4"),
        ]);
        setArticles(articlesRes.articles || []);
        setPrograms(programsRes.programs || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load content");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleEnroll = (programId: string) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/user/training-programs/${programId}/enroll`);
      toast.info("Please log in to enroll in training programs");
      return;
    }
    router.push(`/user/training-programs/${programId}/enroll`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Resume Tips":
        return <FileText className="h-6 w-6" />;
      case "Interview Tips":
      case "Networking":
        return <Users className="h-6 w-6" />;
      case "Career Growth":
        return <TrendingUp className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-2xl mb-6">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Career Advice & <span className="text-[#B260E6]">Skills Training</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enhance your career with expert advice and comprehensive skills training programs
          </p>
        </div>

        {/* Career Advice Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookOpen className="mr-3 h-8 w-8 text-[#B260E6]" />
              Career Advice
            </h2>
            <Link href="/career-advice/articles">
              <Button variant="outline" className="border-[#B260E6] text-[#B260E6] hover:bg-[#B260E6] hover:text-white hover:border-[#B260E6]">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No articles available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <Card key={article._id} className="bg-white hover:shadow-xl transition-shadow duration-300 border border-gray-200 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        {getCategoryIcon(article.category)}
                      </div>
                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10 text-[#B260E6] rounded-full text-sm font-medium mb-2">
                          {article.category}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h3>
                        <p className="text-gray-600 mb-4">{article.excerpt}</p>
                        <Link href={`/career-advice/articles/${article._id}`}>
                          <Button variant="outline" size="sm" className="group">
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Skills Training Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <Target className="mr-3 h-8 w-8 text-[#ED84A5]" />
              Skills Training Programs
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading training programs...</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No training programs available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>
                    <Button 
                      onClick={() => handleEnroll(program._id)}
                      className="w-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white"
                    >
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Call to Action */}
        <Card className="mt-12 bg-white border border-gray-200 shadow-lg bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Advance Your Career?</h3>
            <p className="text-gray-600 mb-6">
              Explore our full range of training programs and career resources to take your career to the next level.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/career-advice/training-programs">
                <Button className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white">
                  View All Training Programs
                </Button>
              </Link>
              <Link href="/career-advice/articles">
                <Button variant="outline" className="border-[#B260E6] text-[#B260E6] hover:bg-[#B260E6] hover:text-white hover:border-[#B260E6]">
                  Read Career Articles
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
