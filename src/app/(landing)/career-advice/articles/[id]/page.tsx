"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Eye, BookOpen } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/useToast";

interface CareerArticle {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  createdAt: string;
  views: number;
  featuredImage?: string;
  tags: string[];
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [article, setArticle] = useState<CareerArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ article: CareerArticle }>(`/api/career-articles/${params.id}`);
        setArticle(response.article);
      } catch (error) {
        console.error("Error fetching article:", error);
        toast.error("Failed to load article");
        router.push("/career-advice/articles");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchArticle();
    }
  }, [params.id, router, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Button>

        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardContent className="p-8">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10 text-[#B260E6] rounded-full text-sm font-medium mb-4">
                {article.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{article.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {article.author}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(article.createdAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  {article.views} views
                </div>
              </div>
            </div>

            {article.featuredImage && (
              <div className="mb-8 rounded-xl overflow-hidden">
                <img src={article.featuredImage} alt={article.title} className="w-full h-auto" />
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{article.content}</div>
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
