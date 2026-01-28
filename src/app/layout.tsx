import type { Metadata } from "next";
import { Geist,  Geist_Mono  } from "next/font/google"
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "JobSync - Verified Workforce Platform | Trusted Credentials & AI Career Tools",
  description:
    "JobSync unifies verified candidates, employers, and institutions in one secure ecosystem for digital credentials, job matching, and workforce compliance.",
  keywords: `
  "verified workforce",
  "credential verification software",
  "portable qualifications",
  "compliance platform",
  "AI job assistant",
  "white-label HR software",
  "verified job seekers Australia",`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
        <ErrorBoundary>
          <ConditionalNavbar />
          {children}
          <ConditionalFooter />
          <Toaster position="top-right" richColors />
        {/* <iframe
          src="https://jobsync.gcucsstudent.site/"
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 420,
            height: 850,
            border: "none",
            borderRadius: 20,
            overflow: "hidden",
            zIndex: 9999,
          }}
          allow="microphone; camera; autoplay"
        ></iframe> */}
        </ErrorBoundary>
      </body>
    </html>
  );
}
