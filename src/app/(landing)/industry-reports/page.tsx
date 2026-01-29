"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, TrendingUp, BarChart3, ArrowRight } from "lucide-react";

export default function IndustryReportsPage() {
  const reports = [
    {
      id: 1,
      title: "Australian Job Market Outlook 2024",
      description: "Comprehensive analysis of employment trends, growth sectors, and opportunities across Australia.",
      date: "2024-01-15",
      category: "Market Analysis",
      downloads: 1250,
    },
    {
      id: 2,
      title: "Skills Gap Report: Construction Industry",
      description: "An in-depth look at the skills shortage in Australia's construction sector and how to address it.",
      date: "2024-01-10",
      category: "Industry Specific",
      downloads: 890,
    },
    {
      id: 3,
      title: "Remote Work Trends in Australia",
      description: "How remote work is reshaping the Australian employment landscape post-pandemic.",
      date: "2024-01-05",
      category: "Workplace Trends",
      downloads: 2100,
    },
    {
      id: 4,
      title: "Mining Sector Employment Report",
      description: "Current state and future prospects of employment in Australia's mining industry.",
      date: "2023-12-20",
      category: "Industry Specific",
      downloads: 750,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-2xl mb-6">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Industry <span className="text-[#B260E6]">Reports</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Data-driven insights and analysis to help you understand the Australian job market
          </p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reports.map((report) => (
            <Card key={report.id} className="bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10 text-[#B260E6] rounded-full text-sm font-medium mb-3">
                      {report.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{report.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{report.description}</p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Download className="h-4 w-4 mr-1" />
                    {report.downloads.toLocaleString()} downloads
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(report.date).toLocaleDateString()}
                  </div>
                </div>
                <Button className="w-full mt-4 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">More Reports Coming Soon</h3>
          <p className="text-gray-600 dark:text-gray-300">
            We're constantly analyzing the job market to bring you the latest insights and trends.
          </p>
        </div>
      </div>
    </div>
  );
}
