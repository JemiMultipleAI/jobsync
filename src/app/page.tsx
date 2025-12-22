/* eslint-disable @next/next/no-img-element */
"use client";


import AutoSlider from "@/components/ui/AutoSlider";
import { Button } from "@/components/ui/button";
import { CheckCircle, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  ArrowRight,
  FileCheck,
  Bot,
  Cloud,
  Users,
  BadgeCheck,
} from "lucide-react"

export default function Home() {
  const stats = [
    { number: "50,000+", label: "Verified Professionals" },
    { number: "10,000+", label: "Trusted Employers" },
    { number: "100,000+", label: "Credentials Verified" },
    { number: "98%", label: "Compliance Rate" },
  ];

  const industries = [
    {
      name: "Construction",
      image: "/images/construction.png",
      verified: true,
    },
    {
      name: "Education",
      image: "/images/learning.png",
      verified: true,
    },
    {
      name: "Energy",
      image: "/images/energy 1.png",
      verified: true,
    },
    {
      name: "Logistics",
      image: "/images/logistics 1.png",
      verified: true,
    },
    {
      name: "Healthcare",
      image: "/images/healthcare 1.png",
      verified: true,
    },
    {
      name: "Mining",
      image: "/images/mining 1.png",
      verified: true,
    },
  ];

  const features = [
    {
      icon: <FileCheck className="h-10 w-10" />,
      title: "Verified Credentials",
      description:
        "Every document is validated for authenticity and expiry with trusted verification partners",
    },
    {
      icon: <Bot className="h-10 w-10" />,
      title: "AI Career Assistant",
      description:
        "Generate professional CVs, understand contracts, and get real-time job suggestions",
    },
    {
      icon: <Cloud className="h-10 w-10" />,
      title: "User Owned Data",
      description:
        "Your documents stay in your cloud (Google Drive, OneDrive, Box) - we never take ownership",
    },
  ];

  const featuredJobs = [
    {
      title: "Experienced Plumber",
      company: "AquaFlow Services",
      location: "Sydney, NSW",
      salary: "$75,000 - $95,000/year",
      type: "Full-time",
      posted: "2 days ago",
      image: "/images/plumber.png",
    },
    {
      title: "Commercial Electrician",
      company: "BrightVolt Ltd.",
      location: "Melbourne, VIC",
      salary: "$85,000 - $110,000/year",
      type: "Full-time",
      posted: "1 day ago",
      image: "/images/electrician.png",
    },
    {
      title: "Construction Site Manager",
      company: "UrbanBuild Co.",
      location: "Brisbane, QLD",
      salary: "$120,000 - $150,000/year",
      type: "Full-time",
      posted: "3 days ago",
      image: "/images/construction.png",
    },
    {
      title: "Heavy Vehicle Driver  Logistics",
      company: "TransRoad Logistics",
      location: "Perth, WA",
      salary: "$65,000 - $80,000/year",
      type: "Full-time",
      posted: "4 days ago",
      image: "/images/driver.png",
    },
    {
      title: "Senior Painter / Decorator",
      company: "ColourFinish Pty Ltd",
      location: "Adelaide, SA",
      salary: "$55,000 - $70,000/year",
      type: "Full-time",
      posted: "5 days ago",
      image: "/images/painter.png",
    },
    {
      title: "Chef de Partie  Hotel Kitchen",
      company: "GrandHarbour Hotel & Resorts",
      location: "Sydney, NSW",
      salary: "$60,000 - $75,000/year",
      type: "Full-time",
      posted: "2 days ago",
      image: "/images/chef.png",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/images/hero-background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 bg-gradient-to-r from-[#B260E6]/70 to-[#ED84A5]/60 z-10" />

        <div className="relative z-20 max-w-6xl mx-auto p-6 text-center text-white">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">
                One Profile, Verified Once, Used Everywhere
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Australia&apos;s Verified
            <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              <br />Workforce Platform
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
            <strong>A single profile. Verified once. Accepted everywhere.</strong><br />
            Workers, employers, and agencies connect through one compliant, portable,<br />
            cloud-backed system that keeps credentials current and hiring friction-free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/auth/register">
              <Button className="bg-white text-[#B260E6] hover:bg-gray-100 font-semibold px-8 py-6 text-lg rounded-full shadow-lg transition-all duration-300 hover:scale-105">
                Create Your Verified Profile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-transparent border-2 border-white text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-full transition-all duration-300">
                For Employers
              </Button>
            </Link>
          </div>

          <ul className="text-lg md:text-xl opacity-90">
            <li>Free for workers</li>
            <li>Automatic license & certificate expiry tracking</li>
            <li>Industry-ready compliance from day one</li>
          </ul>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30 mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-gray-600 mb-8 text-lg">
            Trusted by Australia&apos;s leading companies and institutions
          </p>
          <AutoSlider>
            {[
              {
                src: "https://www.tailorbrands.com/wp-content/uploads/2020/04/australian-logos-header.webp",
                alt: "Qantas",
              },
              {
                src: "https://www.tailorbrands.com/wp-content/uploads/2020/04/qantas-vector-logo.webp",
                alt: "Commonwealth Bank",
              },
              {
                src: "https://www.tailorbrands.com/wp-content/uploads/2020/04/abc-logo.webp",
                alt: "Woolworths",
              },
              {
                src: "https://www.tailorbrands.com/wp-content/uploads/2020/04/commonwealth-bank-logo.webp",
                alt: "Telstra",
              },
              {
                src: "https://www.tailorbrands.com/wp-content/uploads/2020/04/Melbourne-logo.webp",
                alt: "BHP",
              },
              {
                src: "https://www.tailorbrands.com/wp-content/uploads/2020/04/Woolworths-logo.webp",
                alt: "ANZ Bank",
              },
            ].map((logo, index) => (
              <div
                key={index}
                className="flex-[0_0_33%] sm:flex-[0_0_20%] md:flex-[0_0_16.6%] flex justify-center items-center p-4 opacity-60"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="max-h-12 object-contain"
                />
              </div>
            ))}
          </AutoSlider>
        </div>
      </section>

      {/* About JobSync Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Not Just a Job Platform  A Centralised{" "}
              <span className="text-[#B260E6]">Verification Ecosystem</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Today&apos;s workforce deserves more than job listings. It deserves
              trust, proof, and portability. JobSync transforms how
              professionals manage their qualifications and how employers verify
              them.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Where skills meet validation a digital passport that proves your
                readiness for any opportunity, anywhere.
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-[#ED84A5] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      For professionals
                    </h4>
                    <p className="text-gray-600">
                      Store, verify, and showcase your qualifications in one
                      secure place.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-[#ED84A5] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      For employers
                    </h4>
                    <p className="text-gray-600">
                      Access a verified, compliant talent pool instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#B260E6] to-[#ED84A5] rounded-3xl p-8 text-white text-center">
              <Shield className="text-6xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                Your Career. Verified. Portable. Trusted.
              </h3>
              <p className="opacity-90 mb-6">
                The new standard of professional credibility in Australia&apos;s
                workforce
              </p>
              <Link href="/about">
                <Button className="bg-white text-[#B260E6] hover:bg-gray-100">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>




      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How <span className="text-[#ED84A5]">JobSync</span> Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to build your verified career identity and connect
              with trusted opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg text-center p-6">
              <div className="w-16 h-16 bg-[#B260E6] rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Create Your Profile
              </h3>
              <p className="text-gray-600">
                Build your verified career identity complete with education,
                certificates, and experience.
              </p>
            </Card>

            <Card className="border-0 shadow-lg text-center p-6">
              <div className="w-16 h-16 bg-[#ED84A5] rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Verify Instantly</h3>
              <p className="text-gray-600">
                Connect with trusted verification partners to validate your
                licenses and qualifications.
              </p>
            </Card>

            <Card className="border-0 shadow-lg text-center p-6">
              <div className="w-16 h-16 bg-[#B260E6] rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Stay Job-Ready</h3>
              <p className="text-gray-600">
                Automatic expiry tracking and AI reminders keep you compliant
                and up-to-date.
              </p>
            </Card>

            <Card className="border-0 shadow-lg text-center p-6">
              <div className="w-16 h-16 bg-[#ED84A5] rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Discover Opportunities
              </h3>
              <p className="text-gray-600">
                Get matched with roles that align with your verified credentials
                and industry preferences.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">




            {/* For Individuals Section */}
          </div>
        </div>
      </section>
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Beyond Recruitment It&apos;s a{" "}
              <span className="text-[#B260E6]">Workforce Revolution</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unlike typical job sites, JobSync combines compliance, AI
              assistance, and verified career mobility in one intuitive
              platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Individuals Section - separate, full-width section */}
      <section className="py-24 bg-gray-50 flex justify-center">
        <Card className="w-full max-w-lg border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <Users className="h-12 w-12 text-[#B260E6] mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                For Individuals
              </h3>
              <p className="text-xl text-gray-600">
                Take Control of Your Career One Verified Step at a Time
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {[
                "Store, verify, and renew your qualifications automatically",
                "Build a professional CV guided by AI — no writing needed",
                "Access industry-matched job listings across multiple platforms",
                "Gain recognition through verified digital badges",
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#ED84A5] flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="text-center p-4 bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10 rounded-xl mb-6">
              <p className="text-lg font-semibold text-gray-900">
                Your career. Verified. Portable. Trusted.
              </p>
            </div>

            <Link href="/auth/register">
              <Button className="w-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white py-4 text-lg">
                Create Your Verified Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>




      {/* Industries We Empower */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto ">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Industries We <span className="text-[#ED84A5]">Empower</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              JobSync is built for compliance driven industries where trust and
              verification are critical.
            </p>
          </div>

          <AutoSlider>
            {industries.map((industry, index) => (
              <Card
                key={index}
                className="flex-[0_0_60%] sm:flex-[0_0_40%] md:flex-[0_0_25%] lg:flex-[0_0_20%] 
                 rounded-xl overflow-hidden shadow-lg border-0 mx-3 
                 transition-transform duration-300 hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, #B260E6 0%, #ED84A5 100%)",
                }}
              >
                <div className="flex flex-col items-center justify-center text-center p-6">
                  {/* Industry Image */}
                  <div className="w-50 h-40 mb-4 rounded-lg overflow-hidden bg-white/20 flex items-center justify-center">
                    <img
                      src={industry.image}
                      alt={industry.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Industry Title */}
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {industry.name}
                  </h3>

                  {/* Verified Badge */}
                  {industry.verified && (
                    <div className="flex items-center justify-center space-x-1 text-sm text-white/90">
                      <BadgeCheck className="h-4 w-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </AutoSlider>

          <div className="text-center mt-8">
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether it&apos;s FIFO mining, hospital staffing, or logistics
              operations we help organisations verify, hire, and mobilise
              talent with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Jobs with Australian Locations */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Featured <span className="text-[#B260E6]">Job Openings</span>
              </h2>
              <p className="text-xl text-gray-600">
                Latest opportunities across Australian cities and regions
              </p>
            </div>
            <Link href="/jobs">
              <Button
                variant="outline"
                className="mt-4 md:mt-0 border-[#B260E6] text-[#B260E6] hover:bg-[#B260E6] hover:text-white"
              >
                View All Jobs
              </Button>
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={job.image}
                    alt={job.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {job.posted}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 font-medium">{job.company}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-[#ED84A5]" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-[#ED84A5]" />
                      {job.salary}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-[#ED84A5]" />
                      {job.type}
                    </div>
                  </div>

                  <Link href="/auth/register">
                    <Button className="w-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white rounded-full">
                      Apply Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonial Section with Australian Workers */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Stories from{" "}
              <span className="text-[#ED84A5]">Australian Workers</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from skilled professionals who found their dream jobs through
              JobSync
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Image
                  src="/images/sarah.png"
                  alt="Sarah Johnson"
                  width={80}
                  height={80}
                  className="rounded-full mr-6"
                />
                <div>
                  <h4 className="text-xl font-bold">Sarah Johnson</h4>
                  <p className="text-[#B260E6]">Electrician, Melbourne</p>
                  <div className="flex text-yellow-400 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-lg italic">
                &ldquo;JobSync helped me find a stable electrical job in
                Melbourne within a week. The platform connected me with
                reputable companies that value skilled tradespeople.&rdquo;
              </p>
            </Card>

            <Card className="border-0 shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Image
                  src="/images/micheal.png"
                  alt="Michael Chen"
                  width={80}
                  height={80}
                  className="rounded-full mr-6"
                />
                <div>
                  <h4 className="text-xl font-bold">Michael Chen</h4>
                  <p className="text-[#B260E6]">Head Chef, Sydney</p>
                  <div className="flex text-yellow-400 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-lg italic">
                &ldquo;After moving to Sydney, JobSync made it easy to connect
                with top restaurants. I landed my dream chef position at a
                waterfront restaurant!&rdquo;
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Privacy & Trust */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Shield className="h-16 w-16 text-[#B260E6] mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your Credentials. Your Control.
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your personal and professional data always belongs to you. JobSync
            integrates securely with your existing cloud storage without ever
            taking ownership of your documents.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { title: "End-to-end encryption", icon: <Shield className="h-8 w-8 text-[#B260E6]" /> },
              { title: "GDPR & OAIC compliant", icon: <FileCheck className="h-8 w-8 text-[#B260E6]" /> },
              { title: "Role-based access control", icon: <Users className="h-8 w-8 text-[#B260E6]" /> },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="mb-3">{item.icon}</div>
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
              </div>
            ))}

          </div>

          <Link href="/about">
            <Button className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white px-8 py-4 text-lg">
              Learn About Our Security
            </Button>
          </Link>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#B260E6]/90 to-[#ED84A5]/90" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Join the Verified Workforce Revolution
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Be Seen. Be Trusted. Be Ready. JobSync is redefining how the world
            verifies talent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button className="bg-white text-[#B260E6] hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-full shadow-lg">
                Get Started Free
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="bg-transparent border-2 border-white text-white hover:bg-white/20 font-semibold px-8 py-4 text-lg rounded-full">
                Partner With Us
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm opacity-80">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              No document ownership
            </div>
            <div className="flex items-center">f
              <CheckCircle className="h-5 w-5 mr-2" />
              Instant verification
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              White label solutions
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
