"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, FileText, Users, TrendingUp, Calendar, User } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/useToast";

interface CareerArticle {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  createdAt: string;
  views: number;
  featuredImage?: string;
}

export default function AllArticlesPage() {
  const toast = useToast();
  const [articles, setArticles] = useState<CareerArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ limit: "50" });
        if (selectedCategory !== "All") {
          params.append("category", selectedCategory);
        }
        const response = await apiClient.get<{ articles: CareerArticle[] }>(`/api/career-articles?${params.toString()}`);
        setArticles(response.articles || []);
      } catch (error) {
        console.error("Error fetching articles:", error);
        toast.error("Failed to load articles");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [selectedCategory, toast]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Resume Tips":
        return <FileText className="h-5 w-5" />;
      case "Interview Tips":
      case "Networking":
        return <Users className="h-5 w-5" />;
      case "Career Growth":
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const categories = ["All", "Resume Tips", "Interview Tips", "Networking", "Career Growth", "Industry Insights", "Other"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-2xl mb-6">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Career <span className="text-[#B260E6]">Articles</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse all our career advice articles and insights
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category 
                ? "bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white border-0" 
                : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#B260E6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No articles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card key={article._id} className="bg-white hover:shadow-xl transition-shadow duration-300 border border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10 text-[#B260E6] rounded-full text-sm font-medium">
                      {getCategoryIcon(article.category)}
                      <span className="ml-2">{article.category}</span>
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{article.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {article.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(article.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Link href={`/career-advice/articles/${article._id}`}>
                    <Button variant="outline" className="w-full group">
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
