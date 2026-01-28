"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card,  CardContent  } from "@/components/ui/card"
import { MapPin,  Users,  Trophy,  Heart,  ArrowRight,  ChevronLeft,  ChevronRight } from "lucide-react"
import { useEffect, useState  } from "react"

const About = () => {
  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      bio: "Former Seek executive with 15+ years in Australian recruitment and tech innovation",
      avatar : "/images/sarah.PNG",
      location: "Sydney, NSW",
      expertise: ["Recruitment Tech", "Business Strategy", "Leadership"]
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Ex-Atlassian engineer passionate about AI and scalable systems for Australian businesses",
avatar : "/images/micheal.PNG",
      location: "Melbourne, VIC",
      expertise: ["AI/ML", "System Architecture", "Product Development"]
    },
    {
      name: "Lisa Thompson",
      role: "Head of Partnerships",
      bio: "Former government liaison with deep connections across Australian industry sectors",
      avatar : "/images/lisa.PNG",
      location: "Brisbane, QLD",
      expertise: ["Industry Relations", "Business Development", "Government"]
    },
    {
      name: "David Wilson",
      role: "Head of Product",
      bio: "Product leader with focus on user-centered design and Australian market needs",
avatar : "/images/david.png",
      location: "Perth, WA",
      expertise: ["UX Design", "Product Strategy", "Market Research"]
    },
  ];

  // Add these to your component
const [currentSlide, setCurrentSlide] = useState(0);

const goToNext = () => {
  setCurrentSlide((prev) => (prev === milestones.length - 1 ? 0 : prev + 1));
};

const goToPrevious = () => {
  setCurrentSlide((prev) => (prev === 0 ? milestones.length - 1 : prev - 1));
};

// Auto-advance for mobile slider (optional)
useEffect(() => {
  const interval = setInterval(goToNext, 5000);
  return () => clearInterval(interval);
});

// Make sure your milestones array includes images
const milestones = [
  {
    year: "2018",
    title: "Founded in Perth",
    description: "Started with a vision to transform Perth&apos;s skilled workforce connectivity with a small team passionate about connecting workers with opportunities locally.",
    image: "https://source.unsplash.com/800x600/?perth-city,startup-office",
    stats: "10+ founding team members"
  },
  {
    year: "2019",
    title: "First 5K Perth Users",
    description: "Reached our first major milestone with workers and employers across Perth, building trust in the skilled trades community.",
    image: "https://source.unsplash.com/800x600/?perth-workers,team-meeting",
    stats: "5,000+ registered users"
  },
  {
    year: "2020",
    title: "Local Expansion",
    description: "Opened new offices and partnerships throughout Perth to better serve the local workforce.",
    image: "https://source.unsplash.com/800x600/?perth-business-growth,expansion",
    stats: "3 Perth locations"
  },
  {
    year: "2021",
    title: "Mobile App Launch",
    description: "Launched a mobile app tailored for Perth&apos;s workforce to find opportunities on the go.",
    image: "https://source.unsplash.com/800x600/?mobile-app,perth-tech",
    stats: "20,000+ downloads in Perth"
  },
  {
    year: "2022",
    title: "50K Users in Perth",
    description: "Surpassed fifty thousand registered users locally, becoming a trusted platform for skilled workers in Perth.",
    image: "https://source.unsplash.com/800x600/?perth-success,celebration",
    stats: "50,000+ community members"
  },
  {
    year: "2023",
    title: "Perth Workforce Awards",
    description: "Recognized locally for excellence in connecting Perth&apos;s skilled workforce with businesses.",
    image: "https://source.unsplash.com/800x600/?perth-awards,business-recognition",
    stats: "3 local industry awards"
  },


];
  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Community First",
      description: "We prioritize the needs of Australian workers and businesses above all else",
      image: "/images/community.png"
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Excellence",
      description: "We deliver exceptional service and outcomes for every Australian we serve",
     image: "/images/exellence.png"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Inclusion",
      description: "We celebrate Australia&apos;s diversity and create opportunities for everyone",
      image: "/images/inclusion.png"
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Local Impact",
      description: "We&apos;re committed to strengthening Australian communities and economies",
      image: "/images/local.png"
    },
  ];

  const stats = [
    { number: "100,000+", label: "Australian Workers", description: "Skilled professionals across the country" },
    { number: "10,000+", label: "Business Partners", description: "Trusted Australian employers" },
    { number: "95%", label: "Success Rate", description: "Of workers find jobs within 4 weeks" },
    { number: "4.9/5", label: "User Rating", description: "From our Australian community" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://source.unsplash.com/1920x1080/?australian-workforce,skilled-trades-australia"
            alt="Australian skilled workforce"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#B260E6]/90 to-[#ED84A5]/90" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Building Australia&apos;s{" "}
            <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Workforce Future
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            We&apos;re connecting skilled Australians with meaningful opportunities, 
            transforming how trades and professions find work across the nation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[#B260E6] hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-full">
              Join Our Mission
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button className="bg-transparent border-2 border-white text-white hover:bg-white/20 font-semibold px-8 py-4 text-lg rounded-full">
              Meet The Team
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-3xl md:text-4xl font-bold text-[#B260E6] mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-gray-600 text-sm">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <div className="relative h-48">
                {/* <Image
                  src="https://source.unsplash.com/600x400/?australian-mission,community-purpose"
                  alt="Our Mission"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                /> */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#B260E6]/80 to-[#ED84A5]/80" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-xl mb-4">
                    🎯
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">Our Mission</h2>
                </div>
              </div>
              <CardContent className="p-8">
                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                  To empower every Australian skilled worker with access to meaningful employment opportunities 
                  and help businesses find the perfect talent to drive our nation&apos;s growth.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  We believe that connecting talent with opportunity should be seamless, transparent, 
                  and focused on building stronger Australian communities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <div className="relative h-48">
                {/* <Image
                  src="https://source.unsplash.com/600x400/?australian-future,innovation"
                  alt="Our Vision"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                /> */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#ED84A5]/80 to-[#B260E6]/80" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-xl mb-4">
                    🔭
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">Our Vision</h2>
                </div>
              </div>
              <CardContent className="p-8">
                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                  To create Australia&apos;s most trusted platform where every skilled professional 
                  can build a rewarding career and every business can access the talent needed to thrive.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  We envision a future where geographical barriers disappear and quality work 
                  is accessible to all Australians, from cities to regional communities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet Our <span className="text-[#B260E6]">Australian Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate professionals dedicated to transforming Australia&apos;s workforce landscape
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{member.name}</h3>
                    <p className="text-[#ED84A5] font-semibold">{member.role}</p>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-2 text-[#B260E6]" />
                    {member.location}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {member.bio}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, skillIndex) => (
                      <span 
                        key={skillIndex}
                        className="px-3 py-1 bg-[#B260E6]/10 text-[#B260E6] rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white">
  <div className="container mx-auto px-6">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold mb-6">
        Our <span className="text-white/90">Australian Journey</span>
      </h2>
      <p className="text-xl opacity-90 max-w-2xl mx-auto">
        From Sydney startup to national platform serving Australian workers and businesses
      </p>
    </div>

    {/* Enhanced Timeline with Slider Features */}
    <div className="max-w-6xl mx-auto">
      {/* Timeline Line */}
      <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-white/20 h-full rounded-full"></div>
      
      {/* Navigation for Mobile */}
      <div className="flex justify-center mb-8 lg:hidden">
        <div className="flex space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-2">
          <button 
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all disabled:opacity-50"
            onClick={goToPrevious}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-2 px-4">
            <span className="font-bold">{currentSlide + 1}</span>
            <span className="opacity-70">/</span>
            <span>{milestones.length}</span>
          </div>
          
          <button 
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all disabled:opacity-50"
            onClick={goToNext}
            disabled={currentSlide === milestones.length - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Timeline Items with Slider */}
      <div className="relative">
        {/* Desktop Timeline */}
        <div className="hidden lg:block space-y-12">
          {milestones.map((milestone, index) => (
            <div 
              key={index} 
              className={`flex items-center group cursor-pointer transition-all duration-500 ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              }`}
              onClick={() => setCurrentSlide(index)}
            >
              {/* Content Card */}
              <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                <Card className="border-0 bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-2/3 p-6 md:p-8">
                      <div className="flex items-center mb-4">
                        <div className="w-3 h-3 bg-white rounded-full mr-3"></div>
                        <span className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                          {milestone.year}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-4 leading-tight">
                        {milestone.title}
                      </h3>
                      
                      <p className="opacity-90 leading-relaxed mb-4">
                        {milestone.description}
                      </p>
                      
                      <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                        <div className="text-sm font-semibold uppercase tracking-wide mb-1 opacity-90">
                          Achievement
                        </div>
                        <div className="font-medium">{milestone.stats}</div>
                      </div>
                    </div>
                    
                    {/* Image Preview */}
                    <div className="md:w-1/3 relative h-48 md:h-auto">
                      {/* <Image
                        src={milestone.image}
                        alt={milestone.title}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      /> */}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Timeline Dot */}
              <div className="relative z-10 w-1/12 flex justify-center">
                <div className={`w-6 h-6 bg-white rounded-full border-4 ${
                  index === currentSlide ? 'border-white scale-125' : 'border-[#B260E6]'
                } transition-all duration-300 shadow-lg`}></div>
              </div>

              {/* Year Indicator */}
              <div className={`w-5/12 ${index % 2 === 0 ? 'pl-8 text-left' : 'pr-8 text-right'}`}>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center inline-block">
                  <div className="text-3xl font-bold mb-2">{milestone.year}</div>
                  <div className="text-sm opacity-90 font-medium">{milestone.stats}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Slider */}
        <div className="lg:hidden">
          <div className="overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {milestones.map((milestone, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Card className="border-0 bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 overflow-hidden">
                    <div className="flex flex-col">
                      {/* Year Header */}
                      <div className="bg-white/20 p-6 text-center">
                        <div className="text-3xl font-bold">{milestone.year}</div>
                        <div className="text-sm opacity-90 mt-1">{milestone.stats}</div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-3 h-3 bg-white rounded-full mr-3"></div>
                          <span className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                            Milestone {index + 1}
                          </span>
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-4 leading-tight">
                          {milestone.title}
                        </h3>
                        
                        <p className="opacity-90 leading-relaxed mb-6">
                          {milestone.description}
                        </p>
                        
                        {/* Image */}
                        <div className="relative h-48 rounded-xl overflow-hidden mb-6">
                          <Image
                            src={milestone.image}
                            alt={milestone.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20"></div>
                        </div>
                        
                        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                          <div className="text-sm font-semibold uppercase tracking-wide mb-1 opacity-90">
                            Key Achievement
                          </div>
                          <div className="font-medium">{milestone.stats}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Progress Dots */}
          <div className="flex justify-center space-x-3 mt-6">
            {milestones.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white scale-125'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Enhanced Stats Section */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
      <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
        <div className="text-3xl font-bold mb-2">50,000+</div>
        <div className="opacity-90">Australian Workers</div>
      </div>
      <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
        <div className="text-3xl font-bold mb-2">10,000+</div>
        <div className="opacity-90">Business Partners</div>
      </div>
      <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
        <div className="text-3xl font-bold mb-2">95%</div>
        <div className="opacity-90">Success Rate</div>
      </div>
      <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
        <div className="text-3xl font-bold mb-2">4.9/5</div>
        <div className="opacity-90">User Rating</div>
      </div>
    </div>
  </div>
</section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-[#B260E6]">Australian Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide our work and define our commitment to Australia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden hover:scale-105"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={value.image}
                    alt={value.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
                      {value.icon}
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Build Australia&apos;s Future With Us?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Whether you&apos;re looking for your next opportunity or want to partner with us 
              to strengthen Australia&apos;s workforce, we&apos;d love to connect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-[#B260E6] hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-full">
                Join Our Team
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button className="bg-transparent border-2 border-white text-white hover:bg-white/20 font-semibold px-8 py-4 text-lg rounded-full">
                Partner With Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;