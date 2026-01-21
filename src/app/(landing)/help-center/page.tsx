"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Search, MessageCircle, Book, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Book className="h-5 w-5" />,
      articles: [
        { id: 1, title: "How to create an account", link: "#" },
        { id: 2, title: "Setting up your profile", link: "#" },
        { id: 3, title: "Verifying your credentials", link: "#" },
        { id: 4, title: "Finding your first job", link: "#" },
      ],
    },
    {
      id: "for-workers",
      title: "For Workers",
      icon: <MessageCircle className="h-5 w-5" />,
      articles: [
        { id: 5, title: "How to apply for jobs", link: "#" },
        { id: 6, title: "Managing your applications", link: "#" },
        { id: 7, title: "Updating your resume", link: "#" },
        { id: 8, title: "Job alerts and notifications", link: "#" },
      ],
    },
    {
      id: "for-employers",
      title: "For Employers",
      icon: <MessageCircle className="h-5 w-5" />,
      articles: [
        { id: 9, title: "Posting a job listing", link: "#" },
        { id: 10, title: "Reviewing applications", link: "#" },
        { id: 11, title: "Managing your company profile", link: "#" },
        { id: 12, title: "Finding qualified candidates", link: "#" },
      ],
    },
    {
      id: "account",
      title: "Account & Settings",
      icon: <HelpCircle className="h-5 w-5" />,
      articles: [
        { id: 13, title: "Changing your password", link: "#" },
        { id: 14, title: "Updating email address", link: "#" },
        { id: 15, title: "Privacy settings", link: "#" },
        { id: 16, title: "Deleting your account", link: "#" },
      ],
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-2xl mb-6">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Help <span className="text-[#B260E6]">Center</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions and get support when you need it
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg border-2 border-gray-200 focus:border-[#B260E6] rounded-xl"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <CardContent className="p-6">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-lg flex items-center justify-center text-white">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{category.title}</h3>
                  </div>
                  {expandedCategory === category.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                {expandedCategory === category.id && (
                  <div className="mt-4 space-y-2">
                    {category.articles.map((article) => (
                      <a
                        key={article.id}
                        href={article.link}
                        className="block py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-[#B260E6] transition-colors"
                      >
                        {article.title}
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="bg-white border border-gray-200 shadow-lg bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-2xl mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Still Need Help?</h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to assist you. Get in touch and we'll respond as soon as possible.
            </p>
            <Button className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white">
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
