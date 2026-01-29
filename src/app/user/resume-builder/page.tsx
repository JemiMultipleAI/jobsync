"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { ArrowLeft, Plus, X, Save, Download, Sparkles, Loader2, Lightbulb, Upload, Image as ImageIcon } from "lucide-react";
import DashboardCard from "@/components/shared/DashboardCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface WorkExperience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
  achievements: string[];
  skillsLearned: string[]; // Skills learned from this experience
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  certificateFile?: string;
}

interface Reference {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
}

type ResumeTemplate = "modern" | "classic" | "creative" | "minimal";

// Australian locations for autocomplete
const AUSTRALIAN_LOCATIONS = [
  "Sydney, NSW", "Melbourne, VIC", "Brisbane, QLD", "Perth, WA", "Adelaide, SA",
  "Canberra, ACT", "Darwin, NT", "Hobart, TAS", "Gold Coast, QLD", "Newcastle, NSW",
  "Wollongong, NSW", "Geelong, VIC", "Townsville, QLD", "Cairns, QLD", "Toowoomba, QLD",
  "Ballarat, VIC", "Bendigo, VIC", "Albury, NSW", "Launceston, TAS", "Mackay, QLD",
  "Rockhampton, QLD", "Bunbury, WA", "Coffs Harbour, NSW", "Wagga Wagga, NSW", "Hervey Bay, QLD"
];

export default function ResumeBuilderPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for template selection
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [user, setUser] = useState<any>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [activeLocationField, setActiveLocationField] = useState<{ field: "personalInfo" | "work" | "education"; index?: number } | null>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const locationDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    template: "modern" as ResumeTemplate,
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedIn: "",
      website: "",
      profilePicture: "",
    },
    professionalSummary: "",
    hobbies: "",
    skills: [] as string[],
    workExperience: [] as WorkExperience[],
    education: [] as Education[],
    certifications: [] as Certification[],
    references: [] as Reference[],
    additionalInfo: "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [newResponsibility, setNewResponsibility] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const [newSkillLearned, setNewSkillLearned] = useState("");
  const [currentWorkForSkills, setCurrentWorkForSkills] = useState<number | null>(null);
  const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null);
  const [editingEduIndex, setEditingEduIndex] = useState<number | null>(null);
  const [editingCertIndex, setEditingCertIndex] = useState<number | null>(null);
  const [editingRefIndex, setEditingRefIndex] = useState<number | null>(null);
  const [suggestingSkills, setSuggestingSkills] = useState(false);
  const [suggestingResponsibilities, setSuggestingResponsibilities] = useState(false);
  const [currentWorkIndex, setCurrentWorkIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchUserProfile();
    
    // Cleanup debounce timer on unmount
    return () => {
      if (locationDebounceRef.current) {
        clearTimeout(locationDebounceRef.current);
      }
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      const data = await apiClient.get<{ user: any }>("/api/auth/profile");
      setUser(data.user);
      setFormData((prev) => ({
        ...prev,
        personalInfo: {
          fullName: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          location: data.user.location || "",
          linkedIn: "",
          website: "",
        },
        skills: data.user.skills || [],
      }));
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleLocationInput = (value: string, field: "personalInfo" | "work" | "education", index?: number) => {
    setActiveLocationField({ field, index });
    
    // Update the field value immediately
    if (field === "personalInfo") {
      setFormData({
        ...formData,
        personalInfo: { ...formData.personalInfo, location: value },
      });
    } else if (field === "work" && index !== undefined) {
      const updated = [...formData.workExperience];
      updated[index].location = value;
      setFormData({ ...formData, workExperience: updated });
    } else if (field === "education" && index !== undefined) {
      const updated = [...formData.education];
      updated[index].location = value;
      setFormData({ ...formData, education: updated });
    }

    // Clear previous debounce timer
    if (locationDebounceRef.current) {
      clearTimeout(locationDebounceRef.current);
    }

    // Fetch autocomplete suggestions if query is long enough (with debounce)
    if (value.length >= 2) {
      locationDebounceRef.current = setTimeout(async () => {
        try {
          const response = await apiClient.get<{ suggestions: string[] }>(
            `/api/location/autocomplete?query=${encodeURIComponent(value)}&country=au`
          );
          setLocationSuggestions(response.suggestions);
          setShowLocationSuggestions(true);
        } catch (error) {
          console.error("Error fetching location suggestions:", error);
          // Fallback to local list if API fails
          const filtered = AUSTRALIAN_LOCATIONS.filter(loc =>
            loc.toLowerCase().includes(value.toLowerCase())
          ).slice(0, 5);
          setLocationSuggestions(filtered);
          setShowLocationSuggestions(true);
        }
      }, 300); // 300ms debounce
    } else {
      setShowLocationSuggestions(false);
      setLocationSuggestions([]);
    }
  };

  const selectLocation = (location: string, field: "personalInfo" | "work" | "education", index?: number) => {
    if (field === "personalInfo") {
      setFormData({
        ...formData,
        personalInfo: { ...formData.personalInfo, location },
      });
    } else if (field === "work" && index !== undefined) {
      const updated = [...formData.workExperience];
      updated[index].location = location;
      setFormData({ ...formData, workExperience: updated });
    } else if (field === "education" && index !== undefined) {
      const updated = [...formData.education];
      updated[index].location = location;
      setFormData({ ...formData, education: updated });
    }
    setShowLocationSuggestions(false);
  };

  const suggestSkills = async () => {
    if (formData.workExperience.length === 0) {
      toast.error("Please add at least one work experience first");
      return;
    }

    setSuggestingSkills(true);
    try {
      const response = await apiClient.post<{ suggestions: string[] }>("/api/resume/suggest-skills", {
        workExperience: formData.workExperience,
        currentSkills: formData.skills,
      });
      
      // Add suggested skills that aren't already in the list
      const newSkills = response.suggestions.filter(skill => !formData.skills.includes(skill));
      if (newSkills.length > 0) {
        setFormData({
          ...formData,
          skills: [...formData.skills, ...newSkills],
        });
        toast.success(`Added ${newSkills.length} suggested skills!`);
      } else {
        toast.info("No new skills to suggest");
      }
    } catch (error) {
      console.error("Error suggesting skills:", error);
      toast.error("Failed to get skill suggestions");
    } finally {
      setSuggestingSkills(false);
    }
  };

  const suggestResponsibilities = async (workIndex: number) => {
    const work = formData.workExperience[workIndex];
    if (!work.position || !work.company) {
      toast.error("Please fill in position and company first");
      return;
    }

    setSuggestingResponsibilities(true);
    setCurrentWorkIndex(workIndex);
    try {
      const response = await apiClient.post<{ suggestions: string[] }>("/api/resume/suggest-responsibilities", {
        position: work.position,
        company: work.company,
        industry: work.location, // Using location as a hint for industry
      });
      
      if (response.suggestions.length > 0) {
        const updated = [...formData.workExperience];
        updated[workIndex].responsibilities = [
          ...updated[workIndex].responsibilities,
          ...response.suggestions.filter(r => !updated[workIndex].responsibilities.includes(r))
        ];
        setFormData({ ...formData, workExperience: updated });
        toast.success(`Added ${response.suggestions.length} suggested responsibilities!`);
      } else {
        toast.info("No suggestions available");
      }
    } catch (error) {
      console.error("Error suggesting responsibilities:", error);
      toast.error("Failed to get responsibility suggestions");
    } finally {
      setSuggestingResponsibilities(false);
      setCurrentWorkIndex(null);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const addWorkExperience = () => {
    setFormData({
      ...formData,
      workExperience: [
        ...formData.workExperience,
        {
          company: "",
          position: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          responsibilities: [],
          achievements: [],
          skillsLearned: [],
        },
      ],
    });
    setEditingWorkIndex(formData.workExperience.length);
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: any) => {
    const updated = [...formData.workExperience];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, workExperience: updated });
  };

  const removeWorkExperience = (index: number) => {
    const updated = formData.workExperience.filter((_, i) => i !== index);
    setFormData({ ...formData, workExperience: updated });
  };

  const addResponsibility = (workIndex: number) => {
    if (newResponsibility.trim()) {
      const updated = [...formData.workExperience];
      updated[workIndex].responsibilities.push(newResponsibility.trim());
      setFormData({ ...formData, workExperience: updated });
      setNewResponsibility("");
    }
  };

  const removeResponsibility = (workIndex: number, respIndex: number) => {
    const updated = [...formData.workExperience];
    updated[workIndex].responsibilities.splice(respIndex, 1);
    setFormData({ ...formData, workExperience: updated });
  };

  const addAchievement = (workIndex: number) => {
    if (newAchievement.trim()) {
      const updated = [...formData.workExperience];
      if (!updated[workIndex].achievements) {
        updated[workIndex].achievements = [];
      }
      updated[workIndex].achievements.push(newAchievement.trim());
      setFormData({ ...formData, workExperience: updated });
      setNewAchievement("");
    }
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          institution: "",
          degree: "",
          field: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
        },
      ],
    });
    setEditingEduIndex(formData.education.length);
  };

  const removeEducation = (index: number) => {
    const updated = formData.education.filter((_, i) => i !== index);
    setFormData({ ...formData, education: updated });
  };

  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [
        ...formData.certifications,
        {
          name: "",
          issuer: "",
          date: "",
        },
      ],
    });
    setEditingCertIndex(formData.certifications.length);
  };

  const removeCertification = (index: number) => {
    const updated = formData.certifications.filter((_, i) => i !== index);
    setFormData({ ...formData, certifications: updated });
  };

  const handleCertFileUpload = async (certIndex: number, file: File) => {
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      
      const response = await apiClient.upload<{ fileUrl: string }>("/api/auth/upload/certificate", formDataUpload);
      
      const updated = [...formData.certifications];
      updated[certIndex].certificateFile = response.fileUrl;
      setFormData({ ...formData, certifications: updated });
      
      toast.success("Certificate file uploaded successfully");
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast.error("Failed to upload certificate file");
    }
  };

  const addReference = () => {
    setFormData({
      ...formData,
      references: [
        ...formData.references,
        {
          name: "",
          title: "",
          company: "",
          email: "",
          phone: "",
          relationship: "",
        },
      ],
    });
    setEditingRefIndex(formData.references.length);
  };

  const removeReference = (index: number) => {
    const updated = formData.references.filter((_, i) => i !== index);
    setFormData({ ...formData, references: updated });
  };

  const generateResume = async () => {
    if (!formData.personalInfo.fullName || !formData.personalInfo.email) {
      toast.error("Please fill in at least your name and email");
      return;
    }

    if (formData.workExperience.length === 0) {
      toast.error("Please add at least one work experience");
      return;
    }

    setGenerating(true);
    try {
      const response = await apiClient.post<{ resume: string }>("/api/resume/generate", {
        ...formData,
        template: selectedTemplate || "modern",
      });
      setGeneratedResume(response.resume);
      setCurrentStep(5); // Move to preview step
      toast.success("Resume generated successfully!");
    } catch (error) {
      console.error("Error generating resume:", error);
      toast.error("Failed to generate resume. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      
      const response = await apiClient.upload<{ imageUrl: string }>("/api/auth/upload/profile-image", formDataUpload);
      
      setFormData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, profilePicture: response.imageUrl },
      }));
      
      toast.success("Profile picture uploaded successfully");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture");
    }
  };

  const saveResumeToProfile = async () => {
    if (!generatedResume) return;

    try {
      setLoading(true);
      // Send HTML to server to convert to PDF and save
      const response = await apiClient.post<{ resume: string }>("/api/resume/save", {
        html: generatedResume,
        filename: `${formData.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`,
      });

      // Update user profile with resume
      await apiClient.put("/api/auth/profile", {
        resume: response.resume,
      });

      toast.success("Resume saved to your profile!");
      router.push("/user/profile");
    } catch (error) {
      console.error("Error saving resume:", error);
      toast.error("Failed to save resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = () => {
    if (!generatedResume) return;

    const blob = new Blob([generatedResume], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formData.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Resume downloaded!");
  };

  const templates = [
    {
      id: "modern" as ResumeTemplate,
      name: "Modern",
      description: "Clean, professional design with emphasis on skills and achievements",
      preview: "📄",
    },
    {
      id: "classic" as ResumeTemplate,
      name: "Classic",
      description: "Traditional format, perfect for conservative industries",
      preview: "📋",
    },
    {
      id: "creative" as ResumeTemplate,
      name: "Creative",
      description: "Bold and eye-catching, ideal for creative fields",
      preview: "🎨",
    },
    {
      id: "minimal" as ResumeTemplate,
      name: "Minimal",
      description: "Simple and elegant, focuses on content over design",
      preview: "✨",
    },
  ];

  const steps = [
    { number: 0, title: "Choose Template" },
    { number: 1, title: "Personal Information" },
    { number: 2, title: "Work Experience" },
    { number: 3, title: "Skills" },
    { number: 4, title: "Education & References" },
    { number: 5, title: "Review & Download" },
  ];

  // Template Selection Step
  if (currentStep === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-[#B260E6]" />
                AI Resume Builder
              </h1>
              <p className="text-muted-foreground mt-1">
                Choose a template to get started
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Resume Template</CardTitle>
            <CardDescription>Choose a template that best fits your industry and style</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedTemplate === template.id
                      ? "ring-2 ring-[#B260E6] border-[#B260E6]"
                      : ""
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{template.preview}</div>
                    <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => {
                  if (selectedTemplate) {
                    setFormData({ ...formData, template: selectedTemplate });
                    setCurrentStep(1);
                  } else {
                    toast.error("Please select a template");
                  }
                }}
                disabled={!selectedTemplate}
                className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]"
              >
                Continue
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-[#B260E6]" />
              AI Resume Builder
            </h1>
            <p className="text-muted-foreground mt-1">
              Build a professional resume with AI-powered suggestions
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.filter(s => s.number > 0).map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.number
                        ? "bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {currentStep > step.number ? "✓" : step.number}
                  </div>
                  <p className="text-xs mt-2 text-center">{step.title}</p>
                </div>
                {index < steps.filter(s => s.number > 0).length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step.number
                        ? "bg-gradient-to-r from-[#B260E6] to-[#ED84A5]"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Personal Information */}
      {currentStep === 1 && (
        <DashboardCard title="Personal Information" description="Tell us about yourself">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.personalInfo.fullName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, fullName: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, email: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.personalInfo.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, phone: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="location">Location</Label>
                <Input
                  ref={locationInputRef}
                  id="location"
                  value={formData.personalInfo.location}
                  onChange={(e) => handleLocationInput(e.target.value, "personalInfo")}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                  placeholder="Start typing..."
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && activeLocationField?.field === "personalInfo" && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {locationSuggestions.map((loc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectLocation(loc, "personalInfo")}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                <Input
                  id="linkedIn"
                  value={formData.personalInfo.linkedIn}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, linkedIn: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/in/yourname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Personal Website</Label>
                <Input
                  id="website"
                  value={formData.personalInfo.website}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, website: e.target.value },
                    })
                  }
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profilePicture">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  {formData.personalInfo.profilePicture ? (
                    <div className="relative">
                      <img
                        src={formData.personalInfo.profilePicture}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-[#B260E6]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, profilePicture: "" }
                        })}
                        className="absolute -top-2 -right-2 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <Input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleProfilePictureUpload(file);
                        }
                      }}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("profilePicture")?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="professionalSummary">Professional Summary</Label>
                <Textarea
                  id="professionalSummary"
                  value={formData.professionalSummary}
                  onChange={(e) =>
                    setFormData({ ...formData, professionalSummary: e.target.value })
                  }
                  placeholder="A brief summary of your professional background and key strengths..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hobbies">Hobbies & Interests (Optional)</Label>
                <Textarea
                  id="hobbies"
                  value={formData.hobbies}
                  onChange={(e) =>
                    setFormData({ ...formData, hobbies: e.target.value })
                  }
                  placeholder="e.g., Reading, Photography, Hiking, Cooking..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setCurrentStep(2)}>
                Next: Experience & Skills
              </Button>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Step 2: Work Experience */}
      {currentStep === 2 && (
        <DashboardCard title="Work Experience" description="Add your work experience">
          <div className="space-y-6">
            {/* Work Experience */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Work Experience</h3>
                <Button onClick={addWorkExperience} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
              {formData.workExperience.map((work, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Work Experience #{index + 1}</h4>
                    <Button
                      onClick={() => removeWorkExperience(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Position *</Label>
                        <Input
                          value={work.position}
                          onChange={(e) =>
                            updateWorkExperience(index, "position", e.target.value)
                          }
                          placeholder="e.g., Senior Electrician"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company *</Label>
                        <Input
                          value={work.company}
                          onChange={(e) =>
                            updateWorkExperience(index, "company", e.target.value)
                          }
                          placeholder="e.g., ABC Construction"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 relative">
                      <Label>Location</Label>
                      <Input
                        value={work.location}
                        onChange={(e) => handleLocationInput(e.target.value, "work", index)}
                        onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                        placeholder="Start typing location..."
                      />
                      {showLocationSuggestions && locationSuggestions.length > 0 && activeLocationField?.field === "work" && activeLocationField?.index === index && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {locationSuggestions.map((loc, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectLocation(loc, "work", index)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              {loc}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="grid gap-4 grid-cols-2">
                      <div className="space-y-2">
                        <Label>Start Date *</Label>
                        <Input
                          type="date"
                          value={work.startDate}
                          onChange={(e) =>
                            updateWorkExperience(index, "startDate", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={work.endDate}
                          onChange={(e) =>
                            updateWorkExperience(index, "endDate", e.target.value)
                          }
                          disabled={work.current}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`current-${index}`}
                        checked={work.current}
                        onCheckedChange={(checked) =>
                          updateWorkExperience(index, "current", checked === true)
                        }
                      />
                      <Label htmlFor={`current-${index}`} className="cursor-pointer">
                        I currently work here
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Responsibilities *</Label>
                        <Button
                          onClick={() => suggestResponsibilities(index)}
                          disabled={suggestingResponsibilities && currentWorkIndex === index}
                          variant="ghost"
                          size="sm"
                        >
                          {suggestingResponsibilities && currentWorkIndex === index ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Suggesting...
                            </>
                          ) : (
                            <>
                              <Lightbulb className="mr-2 h-4 w-4" />
                              AI Suggest
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a responsibility"
                          value={newResponsibility}
                          onChange={(e) => setNewResponsibility(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && editingWorkIndex === index) {
                              e.preventDefault();
                              addResponsibility(index);
                            }
                          }}
                        />
                        <Button
                          onClick={() => addResponsibility(index)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <ul className="list-disc list-inside space-y-1">
                        {work.responsibilities.map((resp, respIndex) => (
                          <li key={respIndex} className="text-sm flex items-center justify-between">
                            <span>{resp}</span>
                            <button
                              onClick={() => removeResponsibility(index, respIndex)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Label>Achievements (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add an achievement"
                          value={newAchievement}
                          onChange={(e) => setNewAchievement(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && editingWorkIndex === index) {
                              e.preventDefault();
                              addAchievement(index);
                            }
                          }}
                        />
                        <Button
                          onClick={() => addAchievement(index)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <ul className="list-disc list-inside space-y-1">
                        {work.achievements.map((ach, achIndex) => (
                          <li key={achIndex} className="text-sm">{ach}</li>
                        ))}
                      </ul>
                    </div>
                    {/* Skills Learned from this Experience */}
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label>Skills Learned from this Experience</Label>
                        <Button
                          onClick={() => suggestSkillsFromExperience(index)}
                          disabled={suggestingSkills && currentWorkForSkills === index}
                          variant="ghost"
                          size="sm"
                        >
                          {suggestingSkills && currentWorkForSkills === index ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Suggesting...
                            </>
                          ) : (
                            <>
                              <Lightbulb className="mr-2 h-4 w-4" />
                              AI Suggest
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a skill learned"
                          value={newSkillLearned}
                          onChange={(e) => setNewSkillLearned(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && editingWorkIndex === index) {
                              e.preventDefault();
                              if (newSkillLearned.trim()) {
                                const updated = [...formData.workExperience];
                                if (!updated[index].skillsLearned) {
                                  updated[index].skillsLearned = [];
                                }
                                updated[index].skillsLearned.push(newSkillLearned.trim());
                                setFormData({ ...formData, workExperience: updated });
                                setNewSkillLearned("");
                              }
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            if (newSkillLearned.trim()) {
                              const updated = [...formData.workExperience];
                              if (!updated[index].skillsLearned) {
                                updated[index].skillsLearned = [];
                              }
                              updated[index].skillsLearned.push(newSkillLearned.trim());
                              setFormData({ ...formData, workExperience: updated });
                              setNewSkillLearned("");
                            }
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {work.skillsLearned?.map((skill, skillIndex) => (
                          <Badge
                            key={skillIndex}
                            variant="secondary"
                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-700"
                          >
                            {skill}
                            <button
                              onClick={() => {
                                const updated = [...formData.workExperience];
                                updated[index].skillsLearned = updated[index].skillsLearned?.filter((_, i) => i !== skillIndex) || [];
                                setFormData({ ...formData, workExperience: updated });
                              }}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Previous
              </Button>
              <Button onClick={() => setCurrentStep(3)}>
                Next: Skills
              </Button>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Step 3: Skills */}
      {currentStep === 3 && (
        <DashboardCard title="Skills" description="Add your general skills">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">General Skills</h3>
                <Button
                  onClick={suggestGeneralSkills}
                  disabled={suggestingSkills}
                  variant="outline"
                  size="sm"
                >
                  {suggestingSkills ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Suggesting...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="mr-2 h-4 w-4" />
                      AI Suggest Soft Skills
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Add general skills, soft skills, and transferable skills. Skills learned from specific work experiences are already captured in the experience section.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button onClick={addSkill} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Previous
              </Button>
              <Button onClick={() => setCurrentStep(4)}>
                Next: Education & References
              </Button>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Step 4: Education & References */}
      {currentStep === 4 && (
        <DashboardCard title="Education & References" description="Add your education, certifications, and references">
          <div className="space-y-6">
            {/* Education */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Education</h3>
                <Button onClick={addEducation} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>
              {formData.education.map((edu, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Education #{index + 1}</h4>
                    <Button
                      onClick={() => removeEducation(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Degree *</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...formData.education];
                          updated[index].degree = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        placeholder="e.g., Bachelor of Engineering"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Institution *</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...formData.education];
                          updated[index].institution = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        placeholder="e.g., University of Sydney"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Field of Study</Label>
                      <Input
                        value={edu.field}
                        onChange={(e) => {
                          const updated = [...formData.education];
                          updated[index].field = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        placeholder="e.g., Electrical Engineering"
                      />
                    </div>
                    <div className="space-y-2 relative">
                      <Label>Location</Label>
                      <Input
                        value={edu.location}
                        onChange={(e) => handleLocationInput(e.target.value, "education", index)}
                        onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                        placeholder="Start typing location..."
                      />
                      {showLocationSuggestions && locationSuggestions.length > 0 && activeLocationField?.field === "education" && activeLocationField?.index === index && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {locationSuggestions.map((loc, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectLocation(loc, "education", index)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              {loc}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => {
                          const updated = [...formData.education];
                          updated[index].startDate = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={edu.endDate}
                        onChange={(e) => {
                          const updated = [...formData.education];
                          updated[index].endDate = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        disabled={edu.current}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Certifications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Certifications</h3>
                <Button onClick={addCertification} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certification
                </Button>
              </div>
              {formData.certifications.map((cert, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Certification #{index + 1}</h4>
                    <Button
                      onClick={() => removeCertification(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Certification Name *</Label>
                      <Input
                        value={cert.name}
                        onChange={(e) => {
                          const updated = [...formData.certifications];
                          updated[index].name = e.target.value;
                          setFormData({ ...formData, certifications: updated });
                        }}
                        placeholder="e.g., Licensed Electrician"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuing Organization *</Label>
                      <Input
                        value={cert.issuer}
                        onChange={(e) => {
                          const updated = [...formData.certifications];
                          updated[index].issuer = e.target.value;
                          setFormData({ ...formData, certifications: updated });
                        }}
                        placeholder="e.g., NSW Fair Trading"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Issue Date</Label>
                      <Input
                        type="date"
                        value={cert.date}
                        onChange={(e) => {
                          const updated = [...formData.certifications];
                          updated[index].date = e.target.value;
                          setFormData({ ...formData, certifications: updated });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Certificate File (Photo/PDF)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleCertFileUpload(index, file);
                            }
                          }}
                          className="flex-1"
                        />
                        {cert.certificateFile && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            Uploaded
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* References */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">References</h3>
                <Button onClick={addReference} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reference
                </Button>
              </div>
              {formData.references.map((ref, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Reference #{index + 1}</h4>
                    <Button
                      onClick={() => removeReference(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={ref.name}
                        onChange={(e) => {
                          const updated = [...formData.references];
                          updated[index].name = e.target.value;
                          setFormData({ ...formData, references: updated });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={ref.title}
                        onChange={(e) => {
                          const updated = [...formData.references];
                          updated[index].title = e.target.value;
                          setFormData({ ...formData, references: updated });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={ref.company}
                        onChange={(e) => {
                          const updated = [...formData.references];
                          updated[index].company = e.target.value;
                          setFormData({ ...formData, references: updated });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={ref.email}
                        onChange={(e) => {
                          const updated = [...formData.references];
                          updated[index].email = e.target.value;
                          setFormData({ ...formData, references: updated });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={ref.phone}
                        onChange={(e) => {
                          const updated = [...formData.references];
                          updated[index].phone = e.target.value;
                          setFormData({ ...formData, references: updated });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Relationship</Label>
                      <Input
                        value={ref.relationship}
                        onChange={(e) => {
                          const updated = [...formData.references];
                          updated[index].relationship = e.target.value;
                          setFormData({ ...formData, references: updated });
                        }}
                        placeholder="e.g., Former Supervisor"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Previous
              </Button>
              <Button
                onClick={generateResume}
                disabled={generating}
                className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Resume with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Step 5: Review & Download */}
      {currentStep === 5 && generatedResume && (
        <DashboardCard title="Your Generated Resume" description="Review and download your AI-generated resume">
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
              <iframe
                srcDoc={generatedResume}
                className="w-full h-[800px] border-0 rounded"
                title="Resume Preview"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadResume} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download as HTML
              </Button>
              <Button
                onClick={saveResumeToProfile}
                disabled={loading}
                className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save to Profile
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Edit Resume
              </Button>
            </div>
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
