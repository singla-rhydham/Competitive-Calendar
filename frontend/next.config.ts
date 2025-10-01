import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Do not block builds on ESLint errors (useful for Vercel)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep type checks in CI; set to true temporarily only if needed
    ignoreBuildErrors: false,
  },
  images: {
    // Allow Google OAuth profile image hosts
    domains: ["lh3.googleusercontent.com", "lh5.googleusercontent.com", "googleusercontent.com"],
  },
};

export default nextConfig;
