"use client";

import Link from "next/link";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  ArrowRight,
  Building,
  Users,
  Award,
  Shield
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white font-bold text-lg shadow-lg">
                S
              </div>
              <div>
                <span className="font-bold text-2xl bg-gradient-to-r from-[#B260E6] to-[#ED84A5] bg-clip-text text-transparent">
                  JobSync
                </span>
                <p className="text-sm text-gray-300 -mt-1">Australia</p>
              </div>
            </Link>
            
            <p className="text-lg text-gray-300 max-w-md leading-relaxed">
              Connecting Australia&apos;s skilled workforce with meaningful opportunities. 
              Building stronger communities through employment.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Shield className="h-4 w-4 text-[#ED84A5]" />
                <span>Secure & Verified</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Award className="h-4 w-4 text-[#ED84A5]" />
                <span>Australian Owned</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Users className="h-4 w-4 text-[#ED84A5]" />
                <span>100,000+ Members</span>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="bg-gradient-to-r from-[#B260E6]/20 to-[#ED84A5]/20 rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
            <p className="text-gray-300 mb-4">
              Get the latest job opportunities and industry news delivered to your inbox.
            </p>
            <div className="flex space-x-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-[#B260E6] focus:border-transparent outline-none text-white placeholder-gray-400"
              />
              <button className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] hover:from-[#A050D6] hover:to-[#DD74A5] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg">
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* For Workers */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-[#ED84A5]" />
              For Workers
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/jobs" className="text-gray-300 hover:text-[#B260E6] transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 text-[#ED84A5] group-hover:text-[#B260E6] transition-colors" />
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link href="/companies" className="text-gray-300 hover:text-[#B260E6] transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 text-[#ED84A5] group-hover:text-[#B260E6] transition-colors" />
                  Browse Companies
                </Link>
              </li>
              <li>
                <Link href="/career-advice" className="text-gray-300 hover:text-[#B260E6] transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 text-[#ED84A5] group-hover:text-[#B260E6] transition-colors" />
                  Career Advice
                </Link>
              </li>
              <li>
                <Link href="/skills-training" className="text-gray-300 hover:text-[#B260E6] transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 text-[#ED84A5] group-hover:text-[#B260E6] transition-colors" />
                  Skills Training
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-[#ED84A5]" />
              For Employers
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/post-job" className="text-gray-300 hover:text-[#B260E6] transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 text-[#ED84A5] group-hover:text-[#B260E6] transition-colors" />
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/find-workers" className="text-gray-300 hover:text-[#B260E6] transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 text-[#ED84A5] group-hover:text-[#B260E6] transition-colors" />
                  Find Workers
                </Link>
              </li>
              <li>
                <Link href="/employer-solutions" className="text-gray-300 hover:text-[#B260E6] transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 text-[#ED84A5] group-hover:text-[#B260E6] transition-colors" />
                  Employer Solutions
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-[#B260E6] transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 text-[#ED84A5] group-hover:text-[#B260E6] transition-colors" />
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-[#B260E6] transition-colors">
                  Blog & Insights
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-gray-300 hover:text-[#B260E6] transition-colors">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="/industry-reports" className="text-gray-300 hover:text-[#B260E6] transition-colors">
                  Industry Reports
                </Link>
              </li>
              <li>
                <Link href="/help-center" className="text-gray-300 hover:text-[#B260E6] transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-[#B260E6] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-[#B260E6] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-[#B260E6] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-[#B260E6] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-xl flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Level 28, 140 St Georges Tce Perth, Western Australia 6000</p>
              <p className="text-gray-300 text-sm">Perth</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-xl flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Call Us</p>
              <p className="text-gray-300 text-sm">+61 1800 555 123</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-xl flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Email Us</p>
              <p className="text-gray-300 text-sm">support@jobsync.com.au</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} SkillLink Australia. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 hover:bg-[#B260E6] rounded-xl flex items-center justify-center transition-all duration-300 group"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-gray-300 group-hover:text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 hover:bg-[#B260E6] rounded-xl flex items-center justify-center transition-all duration-300 group"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-gray-300 group-hover:text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 hover:bg-[#B260E6] rounded-xl flex items-center justify-center transition-all duration-300 group"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-gray-300 group-hover:text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 hover:bg-[#B260E6] rounded-xl flex items-center justify-center transition-all duration-300 group"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-gray-300 group-hover:text-white" />
              </a>
            </div>

            {/* Additional Links */}
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="/sitemap" className="hover:text-[#ED84A5] transition-colors">
                Sitemap
              </Link>
              <Link href="/accessibility" className="hover:text-[#ED84A5] transition-colors">
                Accessibility
              </Link>
              <Link href="/cookies" className="hover:text-[#ED84A5] transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}