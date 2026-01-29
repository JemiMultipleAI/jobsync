"use client";

import { Shield, Lock, Eye, FileText, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: <FileText className="h-6 w-6" />,
      content: [
        "JobSync Australia ('we', 'our', or 'us') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, website, and services.",
        "By using JobSync, you agree to the collection and use of information in accordance with this policy. We comply with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth).",
      ],
    },
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: <Eye className="h-6 w-6" />,
      content: [
        "We collect information that you provide directly to us, including:",
        "• Personal identification information (name, email address, phone number, date of birth)",
        "• Professional information (resume, work history, qualifications, certifications, skills)",
        "• Profile information (bio, location, preferences, profile photo)",
        "• Account credentials (email, password - stored securely using encryption)",
        "• Communication data (messages, applications, feedback)",
        "• Payment information (processed securely through third-party payment processors)",
        "We also automatically collect certain information when you use our services:",
        "• Device information (IP address, browser type, operating system)",
        "• Usage data (pages visited, time spent, features used)",
        "• Location data (if you enable location services)",
        "• Cookies and similar tracking technologies",
      ],
    },
    {
      id: "how-we-use",
      title: "How We Use Your Information",
      icon: <Shield className="h-6 w-6" />,
      content: [
        "We use the information we collect to:",
        "• Provide, maintain, and improve our services",
        "• Match you with relevant job opportunities or candidates",
        "• Process and manage job applications",
        "• Verify credentials and qualifications",
        "• Communicate with you about your account, jobs, and our services",
        "• Send you updates, newsletters, and promotional materials (with your consent)",
        "• Detect, prevent, and address technical issues and security threats",
        "• Comply with legal obligations and enforce our terms of service",
        "• Analyze usage patterns to improve user experience",
        "• Conduct research and analytics (in anonymized form)",
      ],
    },
    {
      id: "information-sharing",
      title: "Information Sharing and Disclosure",
      icon: <Lock className="h-6 w-6" />,
      content: [
        "We do not sell your personal information. We may share your information in the following circumstances:",
        "• With employers: When you apply for jobs, we share your profile, resume, and application details with the relevant employer",
        "• With job seekers: Employers can view worker profiles when browsing candidates",
        "• Service providers: We share information with trusted third-party service providers who assist us in operating our platform (e.g., cloud hosting, payment processing, email services)",
        "• Legal requirements: We may disclose information if required by law, court order, or government regulation",
        "• Business transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred",
        "• With your consent: We may share information for other purposes with your explicit consent",
        "All third parties are contractually obligated to protect your information and use it only for specified purposes.",
      ],
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: <Shield className="h-6 w-6" />,
      content: [
        "We implement appropriate technical and organizational security measures to protect your personal information:",
        "• Encryption of data in transit and at rest",
        "• Secure authentication and access controls",
        "• Regular security assessments and updates",
        "• Limited access to personal information on a need-to-know basis",
        "• Secure password storage using industry-standard hashing",
        "However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.",
      ],
    },
    {
      id: "your-rights",
      title: "Your Rights and Choices",
      icon: <FileText className="h-6 w-6" />,
      content: [
        "Under Australian privacy law, you have the right to:",
        "• Access your personal information we hold about you",
        "• Request correction of inaccurate or incomplete information",
        "• Request deletion of your personal information (subject to legal and contractual obligations)",
        "• Opt-out of marketing communications",
        "• Withdraw consent where processing is based on consent",
        "• Lodge a complaint with the Office of the Australian Information Commissioner (OAIC)",
        "You can exercise these rights by contacting us at privacy@jobsync.com.au or through your account settings.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies and Tracking Technologies",
      icon: <Eye className="h-6 w-6" />,
      content: [
        "We use cookies and similar tracking technologies to:",
        "• Remember your preferences and settings",
        "• Authenticate your account",
        "• Analyze how you use our platform",
        "• Provide personalized content and advertisements",
        "You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our platform.",
      ],
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: <Lock className="h-6 w-6" />,
      content: [
        "We retain your personal information for as long as necessary to:",
        "• Provide our services to you",
        "• Comply with legal obligations",
        "• Resolve disputes and enforce agreements",
        "• Maintain business records for legitimate purposes",
        "When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it by law.",
      ],
    },
    {
      id: "children-privacy",
      title: "Children's Privacy",
      icon: <Shield className="h-6 w-6" />,
      content: [
        "Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.",
      ],
    },
    {
      id: "international-transfers",
      title: "International Data Transfers",
      icon: <Lock className="h-6 w-6" />,
      content: [
        "Your information may be transferred to and processed in countries other than Australia. We ensure that appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable privacy laws.",
      ],
    },
    {
      id: "changes",
      title: "Changes to This Privacy Policy",
      icon: <FileText className="h-6 w-6" />,
      content: [
        "We may update this Privacy Policy from time to time. We will notify you of any material changes by:",
        "• Posting the new Privacy Policy on this page",
        "• Sending you an email notification",
        "• Displaying a notice on our platform",
        "The 'Last Updated' date at the top of this page indicates when the policy was last revised. Your continued use of our services after changes become effective constitutes acceptance of the updated policy.",
      ],
    },
    {
      id: "contact",
      title: "Contact Us",
      icon: <Mail className="h-6 w-6" />,
      content: [
        "If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:",
        "Email: privacy@jobsync.com.au",
        "Phone: +61 1800 555 123",
        "Address: Level 28, 140 St Georges Terrace, Perth, Western Australia 6000",
        "We will respond to your inquiry within 30 days.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-2xl mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Privacy <span className="text-[#B260E6]">Policy</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Last Updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-lg flex items-center justify-center text-white mr-4">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{section.title}</h2>
                </div>
                <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {section.content.map((paragraph, index) => (
                    <p key={index} className={paragraph.startsWith('•') ? 'ml-4' : ''}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <Card className="mt-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg bg-gradient-to-r from-[#B260E6]/10 to-[#ED84A5]/10">
          <CardContent className="p-8 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This Privacy Policy is governed by Australian law. If you have concerns about how we handle your personal information, you may contact the Office of the Australian Information Commissioner (OAIC).
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              OAIC Website: <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-[#B260E6] hover:underline">www.oaic.gov.au</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
