"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Briefcase, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
  type: "job" | "company";
  id: string;
  title: string;
  subtitle?: string;
}

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
}

// Fallback translation function if LanguageContext is not available
const t = (key: string) => {
  const translations: Record<string, string> = {
    "search.searching": "Searching...",
    "search.noResults": "No results found",
  };
  return translations[key] || key;
};

export function SearchAutocomplete({ placeholder = "Search jobs, companies...", className = "" }: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      setIsOpen(true);

      try {
        // Search jobs
        const jobsRes = await apiClient.get<{ jobs: Array<{ _id: string; title: string; company: { name: string } }> }>(
          `/api/jobs?search=${encodeURIComponent(query)}&limit=5&status=active`
        );

        // Search companies
        const companiesRes = await apiClient.get<{ companies: Array<{ _id: string; name: string; industry?: string }> }>(
          `/api/companies?search=${encodeURIComponent(query)}&limit=5`
        );

        const jobResults: SearchResult[] = (jobsRes.jobs || []).map((job) => ({
          type: "job" as const,
          id: job._id,
          title: job.title,
          subtitle: job.company?.name,
        }));

        const companyResults: SearchResult[] = (companiesRes.companies || []).map((company) => ({
          type: "company" as const,
          id: company._id,
          title: company.name,
          subtitle: company.industry,
        }));

        setResults([...jobResults, ...companyResults].slice(0, 8));
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    if (result.type === "job") {
      router.push(`/user/jobs/${result.id}`);
    } else {
      router.push(`/companies/${result.id}`);
    }
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="h-9 w-full pl-10 pr-4 rounded-lg bg-background"
        />
      </div>

      {isOpen && (results.length > 0 || loading) && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto shadow-lg">
          <div className="p-2">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">{t("search.searching")}</div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">{t("search.noResults")}</div>
            ) : (
              <div className="space-y-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-start gap-3"
                  >
                    {result.type === "job" ? (
                      <Briefcase className="h-5 w-5 text-[#B260E6] mt-0.5 flex-shrink-0" />
                    ) : (
                      <Building2 className="h-5 w-5 text-[#ED84A5] mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

