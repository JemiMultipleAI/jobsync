'use client';

import React, { useState } from 'react';
import Image from 'next/image';

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import { useToast } from "@/lib/hooks/useToast";

import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Send,
  User,
  Shield
} from 'lucide-react';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const Contact = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        break;
      case 'subject':
        if (!value.trim()) return 'Subject is required';
        if (value.trim().length < 3) return 'Subject must be at least 3 characters';
        break;
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        break;
    }
    return undefined;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    
    const error = validateField(name, value);
    if (error) {
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Thank you for your message! We'll get back to you soon.");
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
      setTouched({});
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Live Chat Support",
      description: "Instant help from our Australian team",
      action: "Start Chat",
      details: "Available 24/7",
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone Support",
      description: "Speak directly with us",
      action: "+61 1800 555 123",
      details: "Mon–Fri, 8:30AM–5:30PM AEST",
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Support",
      description: "Send us your questions",
      action: "support@JobSync.au",
      details: "We reply within 24 hours",
    }
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="relative py-24 bg-gradient-to-br from-[#B260E6] via-[#ED84A5] to-[#B260E6] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
            We're here to help. Reach out to our team for support, questions, or partnerships.
          </p>
        </div>
      </section>

      {/* CONTACT METHODS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow border-gray-200">
                <div className="flex justify-center mb-4 text-[#B260E6]">
                  {method.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <p className="font-medium text-[#ED84A5] mb-1">{method.action}</p>
                <p className="text-sm text-gray-500">{method.details}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Send Us a Message</h2>
            <p className="text-lg text-gray-600">Fill out the form below and we'll get back to you as soon as possible.</p>
          </div>

          <Card className="border-gray-200 shadow-lg">
            <div className="relative h-32 bg-gradient-to-r from-[#B260E6] to-[#ED84A5] rounded-t-xl overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
                <h3 className="text-3xl font-bold mb-2">Send Us a Message</h3>
                <p className="opacity-90 text-base">We typically respond within 24 hours</p>
              </div>
            </div>

            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    label="Full Name"
                    name="name"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name ? errors.name : undefined}
                    required
                    icon={<User className="h-5 w-5" />}
                    showSuccess={touched.name && !errors.name}
                  />

                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email ? errors.email : undefined}
                    required
                    icon={<Mail className="h-5 w-5" />}
                    showSuccess={touched.email && !errors.email}
                  />
                </div>

                {/* Subject */}
                <FormField
                  label="Subject"
                  name="subject"
                  placeholder="What can we help you with?"
                  value={formData.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.subject ? errors.subject : undefined}
                  required
                  icon={<MessageCircle className="h-5 w-5" />}
                  showSuccess={touched.subject && !errors.subject}
                />

                {/* Message */}
                <FormField
                  label="Message"
                  name="message"
                  placeholder="Tell us more about your inquiry..."
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.message ? errors.message : undefined}
                  required
                  multiline
                  rows={5}
                  showSuccess={touched.message && !errors.message}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" /> Send Message
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500 pt-4 border-t">
                  <Shield className="inline-block h-3 w-3 mr-1 text-[#ED84A5]" />
                  Your information is secure and will never be shared.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* PERTH OFFICE */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Visit Our <span className="text-[#B260E6]">Perth Office</span>
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Located in the heart of Perth, Western Australia
          </p>
          <Card className="max-w-2xl mx-auto border-gray-200 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 text-left">
                <MapPin className="h-6 w-6 text-[#B260E6] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">JobSync Headquarters</h3>
                  <p className="text-gray-600 mb-4">
                    123 Tech Street<br />
                    Perth, WA 6000<br />
                    Australia
                  </p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Mon–Fri, 9:00AM–5:00PM AWST</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Contact;
