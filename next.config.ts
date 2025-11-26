import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed static export to enable API routes
  // API routes require server-side rendering

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },

  reactStrictMode: true,
};

export default nextConfig;
