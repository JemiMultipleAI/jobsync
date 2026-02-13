/* eslint-disable @next/next/no-img-element */
"use client";


import AutoSlider from "@/components/ui/AutoSlider";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card"
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ArrowRight,
  FileCheck,
  Bot,
  Cloud,
  BadgeCheck,
  UserPlus,
  ShieldCheck,
  Bell,
  Briefcase,
} from "lucide-react"

export default function Home() {

  const industries = [
    {
      name: "Construction",
      image: "/images/industries/construction.PNG",
      verified: true,
    },
    {
      name: "Education",
      image: "/images/industries/learning.PNG",
      verified: true,
    },
    {
      name: "Energy",
      image: "/images/industries/energy 1.PNG",
      verified: true,
    },
    {
      name: "Logistics",
      image: "/images/industries/logistics 1.PNG",
      verified: true,
    },
    {
      name: "Healthcare",
      image: "/images/industries/healthcare 1.PNG",
      verified: true,
    },
    {
      name: "Mining",
      image: "/images/industries/mining 1.PNG",
      verified: true,
    },
  ];

  const _features = [
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

  const _featuredJobs = [
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
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Video */}
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

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#B260E6]/80 to-[#ED84A5]/80 z-10" />

        {/* Content */}
        <div className="relative z-20 min-h-screen flex flex-col">
          {/* Heading - At the top */}
          <div className="flex-shrink-0 pt-8 md:pt-12 pb-6 text-center text-white px-6">
            <h1 className="text-4xl md:text-6xl font-bold italic leading-tight">
              Australia&apos;s Verified
              <span className="block text-white/90">
                Workforce Platform
              </span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl font-semibold italic">
              A single profile. Verified once. Accepted everywhere.
            </p>
          </div>

          {/* Two Cards Section */}
          <div className="flex-1 flex items-start justify-center px-6 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl w-full">
              {/* Employee Card - Find a Job */}
              <Link href="/jobs" className="group">
                <div className="relative h-[420px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-3xl">
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/electrician.PNG')" }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#B260E6]/90 via-[#B260E6]/50 to-transparent" />
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-10 text-white">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">Find a Job</h2>
                    <p className="text-xl md:text-2xl opacity-90 mb-6">Looking for your next opportunity?</p>
                    <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-8 py-4 group-hover:bg-white/30 transition-colors">
                      <span className="font-bold text-lg">Get Started</span>
                      <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Employer Card - Post a Job */}
              <Link href="/companies" className="group">
                <div className="relative h-[420px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-3xl">
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/construction.PNG')" }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#ED84A5]/90 via-[#ED84A5]/50 to-transparent" />
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-10 text-white">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">Post a Job</h2>
                    <p className="text-xl md:text-2xl opacity-90 mb-6">Looking for verified talent?</p>
                    <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-8 py-4 group-hover:bg-white/30 transition-colors">
                      <span className="font-bold text-lg">Get Started</span>
                      <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
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





      {/* How It Works Section - Process Liner Style */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How <span className="text-[#ED84A5]">JobSync</span> Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to build your verified career identity and connect
              with trusted opportunities
            </p>
          </div>

          {/* Process Timeline */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
              {/* Step 1 */}
              <div className="relative flex flex-col items-center text-center group">
                {/* Icon Circle */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#B260E6] to-[#9645D0] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="h-12 w-12 text-white" />
                </div>
                {/* Step Number */}
                <div className="mt-4 mb-4 text-[#B260E6] font-bold text-lg">
                  Step 1
                </div>
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Create Your Profile
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Build your verified career identity with education, certificates, and experience.
                </p>
                {/* Arrow - Hidden on mobile, shown on lg */}
                <div className="hidden lg:flex absolute -right-6 top-12 text-[#B260E6]">
                  <ArrowRight className="h-10 w-10" strokeWidth={2.5} />
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center text-center group">
                {/* Icon Circle */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#C56ABB] to-[#B260E6] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="h-12 w-12 text-white" />
                </div>
                {/* Step Number */}
                <div className="mt-4 mb-4 text-[#C56ABB] font-bold text-lg">
                  Step 2
                </div>
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Verify Instantly
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Connect with trusted partners to validate your licenses and qualifications.
                </p>
                {/* Arrow - Hidden on mobile, shown on lg */}
                <div className="hidden lg:flex absolute -right-6 top-12 text-[#C56ABB]">
                  <ArrowRight className="h-10 w-10" strokeWidth={2.5} />
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center text-center group">
                {/* Icon Circle */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#D97AAF] to-[#C56ABB] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Bell className="h-12 w-12 text-white" />
                </div>
                {/* Step Number */}
                <div className="mt-4 mb-4 text-[#D97AAF] font-bold text-lg">
                  Step 3
                </div>
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Stay Job-Ready
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Automatic expiry tracking and AI reminders keep you compliant and up-to-date.
                </p>
                {/* Arrow - Hidden on mobile, shown on lg */}
                <div className="hidden lg:flex absolute -right-6 top-12 text-[#D97AAF]">
                  <ArrowRight className="h-10 w-10" strokeWidth={2.5} />
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex flex-col items-center text-center group">
                {/* Icon Circle */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#ED84A5] to-[#D97AAF] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-12 w-12 text-white" />
                </div>
                {/* Step Number */}
                <div className="mt-4 mb-4 text-[#ED84A5] font-bold text-lg">
                  Step 4
                </div>
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Discover Opportunities
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Get matched with roles that align with your verified credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
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
