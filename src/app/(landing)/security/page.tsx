"use client";

import { Shield, Lock, Eye, FileCheck, Users, CheckCircle, Server, Key, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: <Lock className="h-12 w-12 text-[#B260E6]" />,
      title: "End-to-End Encryption",
      description: "All your data is encrypted in transit and at rest using industry-standard AES-256 encryption. Your credentials and personal information are protected with military-grade security.",
    },
    {
      icon: <Shield className="h-12 w-12 text-[#B260E6]" />,
      title: "GDPR & OAIC Compliant",
      description: "We adhere to the Australian Privacy Principles (APPs) under the Privacy Act 1988 and GDPR standards. Your data rights are protected and respected.",
    },
    {
      icon: <Users className="h-12 w-12 text-[#B260E6]" />,
      title: "Role-Based Access Control",
      description: "Only authorized personnel can access specific data. Employers see only what they need to verify your credentials, nothing more.",
    },
    {
      icon: <FileCheck className="h-12 w-12 text-[#ED84A5]" />,
      title: "Verified Document Storage",
      description: "Your documents are stored securely in your own cloud storage (Google Drive, OneDrive, Box). We never take ownership of your files.",
    },
    {
      icon: <Server className="h-12 w-12 text-[#ED84A5]" />,
      title: "Secure Infrastructure",
      description: "Our servers are hosted on enterprise-grade cloud infrastructure with 99.9% uptime, regular security audits, and automated backups.",
    },
    {
      icon: <Key className="h-12 w-12 text-[#ED84A5]" />,
      title: "Multi-Factor Authentication",
      description: "Optional two-factor authentication (2FA) adds an extra layer of security to your account. Protect your verified profile with SMS or authenticator apps.",
    },
  ];

  const complianceStandards = [
    "Australian Privacy Principles (APPs)",
    "Privacy Act 1988 (Cth)",
    "GDPR Compliance",
    "ISO 27001 Security Standards",
    "SOC 2 Type II Certified",
    "Regular Third-Party Security Audits",
  ];

  const dataProtection = [
    {
      title: "Your Data, Your Control",
      description: "You own and control all your data. We never sell your information to third parties. You can export or delete your data at any time.",
    },
    {
      title: "Transparent Privacy Policy",
      description: "Our privacy policy clearly explains how we collect, use, and protect your data. No hidden terms, no surprises.",
    },
    {
      title: "Regular Security Updates",
      description: "We continuously monitor and update our security measures to protect against emerging threats and vulnerabilities.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#B260E6] to-[#ED84A5] text-white py-28 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <Shield className="h-20 w-20 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Security & Privacy
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
            Your credentials and personal information are protected with enterprise-grade security.
            We take your privacy seriously.
          </p>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              How We Protect <span className="text-[#B260E6]">Your Data</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              JobSync employs multiple layers of security to ensure your information remains safe and confidential.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Standards */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <FileCheck className="h-16 w-16 text-[#B260E6] mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Compliance & <span className="text-[#ED84A5]">Standards</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              JobSync meets and exceeds industry standards for data protection and privacy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {complianceStandards.map((standard, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-md"
              >
                <CheckCircle className="h-6 w-6 text-[#ED84A5] flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">{standard}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Eye className="h-16 w-16 text-[#B260E6] mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Your Privacy <span className="text-[#ED84A5]">Matters</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We believe in transparency and giving you full control over your personal information.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {dataProtection.map((item, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Best Practices */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <Globe className="h-16 w-16 text-[#B260E6] mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Security Best <span className="text-[#ED84A5]">Practices</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We recommend these practices to keep your account secure.
            </p>
          </div>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-8">
            <div className="space-y-6">
              {[
                "Use a strong, unique password for your JobSync account",
                "Enable two-factor authentication (2FA) for added security",
                "Never share your login credentials with anyone",
                "Log out from shared or public computers",
                "Keep your contact information up to date",
                "Review your account activity regularly",
                "Report any suspicious activity immediately",
              ].map((practice, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-[#ED84A5] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-lg">{practice}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Questions About Security?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Our security team is here to help. Contact us if you have any concerns or questions about how we protect your data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-white text-[#B260E6] hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-full shadow-lg">
                Contact Security Team
              </Button>
            </Link>
            <Link href="/about">
              <Button className="bg-transparent border-2 border-white text-white hover:bg-white/20 font-semibold px-8 py-4 text-lg rounded-full">
                Learn More About Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

