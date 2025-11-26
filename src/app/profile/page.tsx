"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  MapPin, 
  Calendar, 
  Briefcase, 
  Bookmark, 
  Settings, 
  Eye,
  Download,
  Edit,
  Star,
  Award,
  Clock,
  Building,
  CheckCircle,
  MessageCircle
} from "lucide-react"
import Image from "next/image"

// Mock data - in a real app, this would come from props or API
export default function ProfilePage() {
  const user = {
    name: "Michael Chen",
    title: "Licensed Electrician",
    location: "Sydney, NSW",
    experience: "8 years",
    skills: ["Commercial Wiring", "Solar Installation", "Safety Systems", "Industrial Electrical", "Smart Home Tech"],
    profileCompletion: 85,
    rating: 4.9,
    completedJobs: 47,
    responseRate: 98,
    avatar: "https://source.unsplash.com/400x400/?australian-electrician,portrait",
    coverImage: "https://source.unsplash.com/1200x400/?sydney-skyline,australian-construction"
  }

  const applications = [
    {
      id: "1",
      title: "Commercial Electrician",
      company: "BrightVolt Ltd.",
      location: "Sydney, NSW",
      appliedOn: "2 days ago",
      status: "Under Review",
      salary: "$85,000 - $110,000",
      type: "Full-time",
      companyLogo: "https://source.unsplash.com/100x100/?electrical-company-logo"
    },
    {
      id: "2",
      title: "Electrical Supervisor",
      company: "UrbanBuild Co.",
      location: "Melbourne, VIC",
      appliedOn: "1 week ago",
      status: "Interview",
      salary: "$95,000 - $120,000",
      type: "Full-time",
      companyLogo: "https://source.unsplash.com/100x100/?construction-company-logo"
    },
    {
      id: "3",
      title: "Solar Installation Specialist",
      company: "EcoPower Solutions",
      location: "Brisbane, QLD",
      appliedOn: "2 weeks ago",
      status: "Offer",
      salary: "$80,000 - $100,000",
      type: "Contract",
      companyLogo: "https://source.unsplash.com/100x100/?solar-company-logo"
    },
    {
      id: "4",
      title: "Industrial Electrician",
      company: "Manufacturing Corp",
      location: "Perth, WA",
      appliedOn: "3 weeks ago",
      status: "Rejected",
      salary: "$75,000 - $95,000",
      type: "Full-time",
      companyLogo: "https://source.unsplash.com/100x100/?industrial-company-logo"
    },
  ]

  const savedJobs = [
    { 
      id: "a", 
      title: "Senior Electrician", 
      company: "Premium Electrical", 
      location: "Sydney, NSW", 
      type: "Full-time",
      salary: "$90,000 - $115,000",
      posted: "1 day ago",
      image: "https://source.unsplash.com/400x300/?electrical-work,australia"
    },
    { 
      id: "b", 
      title: "Maintenance Electrician", 
      company: "Facility Services", 
      location: "Melbourne, VIC", 
      type: "Full-time",
      salary: "$75,000 - $95,000",
      posted: "3 days ago",
      image: "https://source.unsplash.com/400x300/?maintenance-electrician,australia"
    },
    { 
      id: "c", 
      title: "Residential Electrician", 
      company: "Home Solutions", 
      location: "Brisbane, QLD", 
      type: "Contract",
      salary: "$70,000 - $90,000",
      posted: "1 week ago",
      image: "https://source.unsplash.com/400x300/?residential-electrical,australia"
    },
  ]

  const stats = [
    { label: "Applications", value: applications.length, icon: Briefcase, color: "from-[#B260E6] to-[#ED84A5]" },
    { label: "Saved Jobs", value: savedJobs.length, icon: Bookmark, color: "from-[#ED84A5] to-[#B260E6]" },
    { label: "Interviews", value: applications.filter((a) => a.status === "Interview").length, icon: MessageCircle, color: "from-[#B260E6] to-purple-400" },
    { label: "Offers", value: applications.filter((a) => a.status === "Offer").length, icon: Award, color: "from-green-400 to-emerald-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Profile Header with Cover Image */}
      <div className="relative bg-white border-b">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] overflow-hidden">
          <Image
            src={user.coverImage}
            alt="Cover background"
            fill
            className="object-cover mix-blend-overlay opacity-20"
          />
        </div>

        {/* Profile Content */}
        <div className="container mx-auto px-6 relative -mt-16 md:-mt-20">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-8">
            {/* Profile Info */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white rounded-full p-2 shadow-lg">
                  <Star className="h-4 w-4 fill-current" />
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-3 pb-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.name}</h1>
                  <Badge className="bg-green-100 text-green-800 border-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <p className="text-xl text-[#B260E6] font-semibold">{user.title}</p>
                <div className="flex items-center gap-4 text-gray-600 flex-wrap">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {user.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {user.experience} experience
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                    {user.rating}/5 rating
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-[#B260E6]/10 text-[#B260E6] border-0">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-300">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white">
                <Download className="h-4 w-4 mr-2" />
                Download CV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Profile Completion */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Profile Completion</h3>
                <p className="text-sm text-gray-600">Complete your profile to get better job matches</p>
              </div>
              <span className="text-lg font-bold text-[#B260E6]">{user.profileCompletion}%</span>
            </div>
            <Progress value={user.profileCompletion} className="h-2 bg-gray-200">
              <div 
                className="h-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-full transition-all duration-300"
                style={{ width: `${user.profileCompletion}%` }}
              />
            </Progress>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-gray-100 p-1 rounded-2xl w-full max-w-md">
            <TabsTrigger 
              value="overview" 
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#B260E6]"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="applications" 
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#B260E6]"
            >
              Applications
            </TabsTrigger>
            <TabsTrigger 
              value="saved" 
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#B260E6]"
            >
              Saved Jobs
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#B260E6]"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-3`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity & Performance */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Applications */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#B260E6]" />
                    Recent Applications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
                      <div>
                        <h4 className="font-semibold text-gray-900">{app.title}</h4>
                        <p className="text-sm text-gray-600">{app.company}</p>
                      </div>
                      <Badge className={
                        app.status === "Offer" ? "bg-green-100 text-green-800" :
                        app.status === "Interview" ? "bg-blue-100 text-blue-800" :
                        app.status === "Under Review" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }>
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-[#B260E6] hover:text-[#A050D6] hover:bg-[#B260E6]/10">
                    View All Applications
                  </Button>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#ED84A5]" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 border border-gray-200 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-gray-900">Response Rate</h4>
                      <p className="text-sm text-gray-600">Employers responding to applications</p>
                    </div>
                    <div className="text-2xl font-bold text-[#ED84A5]">{user.responseRate}%</div>
                  </div>
                  <div className="flex justify-between items-center p-3 border border-gray-200 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-gray-900">Completed Jobs</h4>
                      <p className="text-sm text-gray-600">Through SkillLink platform</p>
                    </div>
                    <div className="text-2xl font-bold text-[#B260E6]">{user.completedJobs}</div>
                  </div>
                  <div className="flex justify-between items-center p-3 border border-gray-200 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-gray-900">Profile Views</h4>
                      <p className="text-sm text-gray-600">This month</p>
                    </div>
                    <div className="text-2xl font-bold text-[#ED84A5]">24</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#B260E6]" />
                  Job Applications ({applications.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {applications.map((application) => (
                    <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                            <Image
                              src={application.companyLogo}
                              alt={`${application.company} logo`}
                              width={48}
                              height={48}
                              className="rounded-xl"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{application.title}</h3>
                            <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center">
                                <Building className="h-4 w-4 mr-1" />
                                {application.company}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {application.location}
                              </span>
                              <span className="text-[#B260E6] font-semibold">{application.salary}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Applied {application.appliedOn}
                              </span>
                              <span className="capitalize">{application.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={
                            application.status === "Offer" ? "bg-green-100 text-green-800 border-0" :
                            application.status === "Interview" ? "bg-blue-100 text-blue-800 border-0" :
                            application.status === "Under Review" ? "bg-yellow-100 text-yellow-800 border-0" :
                            "bg-red-100 text-red-800 border-0"
                          }>
                            {application.status}
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-[#B260E6] hover:text-[#A050D6] hover:bg-[#B260E6]/10">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-[#ED84A5]" />
                  Saved Jobs ({savedJobs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {savedJobs.map((job) => (
                    <Card key={job.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
                      <div className="relative h-32 overflow-hidden">
                        <Image
                          src={job.image}
                          alt={job.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-3 right-3">
                          <Button size="sm" variant="ghost" className="h-8 w-8 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 p-0">
                            <Bookmark className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{job.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{job.company}</p>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-[#ED84A5]" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-[#ED84A5]" />
                            {job.posted}
                          </div>
                          <div className="text-[#B260E6] font-semibold">{job.salary}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white">
                            Apply Now
                          </Button>
                          <Button variant="outline" size="sm" className="border-gray-300">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#B260E6]" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 border border-gray-200 rounded-2xl">
                  <h4 className="font-semibold text-gray-900 mb-4">Profile Information</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input 
                          type="text" 
                          defaultValue="Michael" 
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B260E6] focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input 
                          type="text" 
                          defaultValue="Chen" 
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B260E6] focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input 
                        type="email" 
                        defaultValue="michael.chen@example.com" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B260E6] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input 
                        type="text" 
                        defaultValue="Sydney, NSW" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B260E6] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="border-gray-300">
                    Cancel
                  </Button>
                  <Button className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}