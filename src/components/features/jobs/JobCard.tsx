"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  description: string;
  emoji: string;
  category: string;
  image?: string;
}

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Full-time": "from-green-500 to-emerald-500",
      "Part-time": "from-blue-500 to-cyan-500",
      "Contract": "from-orange-500 to-red-500",
      "Temporary": "from-yellow-500 to-amber-500",
    };
    return colors[type] || "from-gray-500 to-slate-500";
  };

  return (
    <div className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-200 hover:border-transparent hover:scale-[1.02] overflow-hidden">
      {/* Background Image */}
      {job.image && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-5 group-hover:opacity-10 transition-opacity duration-500"
          style={{ backgroundImage: `url(${job.image})` }}
        ></div>
      )}

      <div className="relative z-10">
        {/* Job Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">{job.emoji}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 group-hover:text-primary transition-colors duration-300">
                {job.title}
              </h3>
              <p className="text-slate-600 text-sm">
                {job.company} • {job.location}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 bg-gradient-to-r ${getTypeColor(
              job.type
            )} text-white text-xs font-medium rounded-full shadow-md`}
          >
            {job.type}
          </span>
        </div>

        {/* Job Description */}
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {job.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <span className="text-slate-800 font-medium">{job.salary}</span>
            <span className="text-slate-500 text-sm">🕒 {job.posted}</span>
          </div>

          <Button className="bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium px-4 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
