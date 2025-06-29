import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: false, // Ignore TypeScript errors during build
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
