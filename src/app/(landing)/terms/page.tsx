"use client";

import { FileText, Scale, AlertCircle, CheckCircle, XCircle, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfServicePage() {
  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: <CheckCircle className="h-6 w-6" />,
      content: [
        "By accessing and using JobSync Australia ('JobSync', 'we', 'our', or 'us'), you accept and agree to be bound by these Terms of Service ('Terms'). If you do not agree to these Terms, you must not use our services.",
        "These Terms apply to all users of the JobSync platform, including job seekers, employers, and any other visitors to our website or users of our services.",
        "We reserve the right to modify these Terms at any time. Your continued use of our services after changes are posted constitutes your acceptance of the modified Terms.",
      ],
    },
    {
      id: "description",
      title: "Description of Service",
      icon: <FileText className="h-6 w-6" />,
      content: [
        "JobSync is an online platform that connects skilled workers with employment opportunities in Australia. Our services include:",
        "• Job posting and search functionality",
        "• Profile creation and management",
        "• Application processing and management",
        "• Credential verification services",
        "• Communication tools between workers and employers",
        "• Career resources and training information",
        "We act as an intermediary platform and do not employ workers or guarantee employment. We are not a party to any employment relationship between workers and employers.",
      ],
    },
    {
      id: "user-accounts",
      title: "User Accounts and Registration",
      icon: <CheckCircle className="h-6 w-6" />,
      content: [
        "To use certain features of JobSync, you must create an account. When registering, you agree to:",
        "• Provide accurate, current, and complete information",
        "• Maintain and update your information to keep it accurate",
        "• Maintain the security of your account credentials",
        "• Accept responsibility for all activities under your account",
        "• Notify us immediately of any unauthorized use of your account",
        "You must be at least 18 years old to create an account. You may not create multiple accounts or share your account with others.",
        "We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent, abusive, or illegal activity.",
      ],
    },
    {
      id: "user-conduct",
      title: "User Conduct and Responsibilities",
      icon: <AlertCircle className="h-6 w-6" />,
      content: [
        "You agree not to:",
        "• Post false, misleading, or fraudulent information",
        "• Impersonate any person or entity",
        "• Harass, abuse, or harm other users",
        "• Violate any applicable laws or regulations",
        "• Transmit viruses, malware, or harmful code",
        "• Attempt to gain unauthorized access to our systems",
        "• Use automated systems to scrape or collect data",
        "• Interfere with or disrupt our services",
        "• Use our services for any illegal purpose",
        "• Post discriminatory, offensive, or inappropriate content",
        "Violation of these rules may result in immediate termination of your account and legal action.",
      ],
    },
    {
      id: "job-seekers",
      title: "Job Seeker Terms",
      icon: <CheckCircle className="h-6 w-6" />,
      content: [
        "As a job seeker, you agree to:",
        "• Provide accurate information about your qualifications, experience, and credentials",
        "• Only apply for jobs for which you are qualified",
        "• Respond honestly to employer inquiries",
        "• Maintain the confidentiality of any proprietary information shared by employers",
        "• Comply with all applicable employment laws and regulations",
        "You understand that:",
        "• JobSync does not guarantee job placement or employment",
        "• Employers are solely responsible for hiring decisions",
        "• You are responsible for verifying the legitimacy of job postings and employers",
        "• JobSync is not liable for any employment disputes or issues",
      ],
    },
    {
      id: "employers",
      title: "Employer Terms",
      icon: <CheckCircle className="h-6 w-6" />,
      content: [
        "As an employer, you agree to:",
        "• Post only legitimate job opportunities",
        "• Provide accurate job descriptions, requirements, and compensation information",
        "• Comply with all applicable employment and anti-discrimination laws",
        "• Respect candidate privacy and confidentiality",
        "• Respond to applications in a timely and professional manner",
        "• Not discriminate based on protected characteristics",
        "You understand that:",
        "• You are solely responsible for hiring decisions and employment relationships",
        "• JobSync does not guarantee candidate quality or suitability",
        "• You must conduct your own background checks and verification",
        "• JobSync is not liable for any employment disputes or issues",
        "• You are responsible for compliance with all employment laws and regulations",
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: <FileText className="h-6 w-6" />,
      content: [
        "All content on JobSync, including text, graphics, logos, software, and other materials, is the property of JobSync or its licensors and is protected by Australian and international copyright and trademark laws.",
        "You retain ownership of content you post on JobSync (such as your profile, resume, and job postings). However, by posting content, you grant JobSync a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content for the purpose of operating and promoting our services.",
        "You may not copy, reproduce, distribute, or create derivative works from our content without our express written permission.",
      ],
    },
    {
      id: "payment",
      title: "Payment Terms",
      icon: <Scale className="h-6 w-6" />,
      content: [
        "Some features of JobSync may require payment. By making a payment, you agree to:",
        "• Pay all fees as described at the time of purchase",
        "• Provide accurate payment information",
        "• Authorize us to charge your payment method",
        "• Understand that fees are non-refundable unless otherwise stated",
        "• Comply with our refund policy (if applicable)",
        "All prices are in Australian Dollars (AUD) unless otherwise stated. We reserve the right to change our pricing with 30 days' notice to existing subscribers.",
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers and Limitations",
      icon: <AlertCircle className="h-6 w-6" />,
      content: [
        "JobSync is provided 'as is' and 'as available' without warranties of any kind, either express or implied. We do not guarantee:",
        "• That our services will be uninterrupted, secure, or error-free",
        "• The accuracy, completeness, or reliability of any information on our platform",
        "• That job postings or candidate profiles are accurate or legitimate",
        "• Job placement or employment outcomes",
        "To the maximum extent permitted by Australian law, JobSync's liability is limited to the amount you paid us in the 12 months preceding the claim, or $100 AUD, whichever is greater.",
        "We are not liable for any indirect, incidental, special, or consequential damages arising from your use of our services.",
      ],
    },
    {
      id: "indemnification",
      title: "Indemnification",
      icon: <Scale className="h-6 w-6" />,
      content: [
        "You agree to indemnify and hold harmless JobSync, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:",
        "• Your use of our services",
        "• Your violation of these Terms",
        "• Your violation of any rights of another party",
        "• Any content you post on our platform",
        "• Your employment relationships or disputes",
      ],
    },
    {
      id: "termination",
      title: "Termination",
      icon: <XCircle className="h-6 w-6" />,
      content: [
        "We may suspend or terminate your account and access to our services at any time, with or without cause or notice, for any reason including:",
        "• Violation of these Terms",
        "• Fraudulent or illegal activity",
        "• Extended periods of inactivity",
        "• At our sole discretion",
        "You may terminate your account at any time by contacting us or using account deletion features. Upon termination:",
        "• Your right to use our services immediately ceases",
        "• We may delete your account and associated data",
        "• Provisions that by their nature should survive termination will remain in effect",
      ],
    },
    {
      id: "disputes",
      title: "Dispute Resolution",
      icon: <Scale className="h-6 w-6" />,
      content: [
        "These Terms are governed by the laws of Western Australia, Australia. Any disputes arising from these Terms or your use of our services will be subject to the exclusive jurisdiction of the courts of Western Australia.",
        "Before initiating legal proceedings, you agree to attempt to resolve disputes through good faith negotiation. If negotiation fails, disputes will be resolved through binding arbitration in Perth, Western Australia, in accordance with the rules of the Australian Centre for International Commercial Arbitration.",
      ],
    },
    {
      id: "changes",
      title: "Changes to Terms",
      icon: <FileText className="h-6 w-6" />,
      content: [
        "We reserve the right to modify these Terms at any time. We will notify you of material changes by:",
        "• Posting the updated Terms on this page",
        "• Sending you an email notification",
        "• Displaying a notice on our platform",
        "Your continued use of our services after changes become effective constitutes acceptance of the updated Terms. If you do not agree to the changes, you must stop using our services and may terminate your account.",
      ],
    },
    {
      id: "contact",
      title: "Contact Information",
      icon: <Mail className="h-6 w-6" />,
      content: [
        "If you have questions about these Terms of Service, please contact us:",
        "Email: legal@jobsync.com.au",
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
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Terms of <span className="text-[#B260E6]">Service</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Please read these terms carefully before using JobSync. By using our services, you agree to these terms.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Last Updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Terms Sections */}
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
              By using JobSync, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If you do not agree to these Terms, please do not use our services.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
