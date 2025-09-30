import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Allow Google OAuth profile image hosts
    domains: ["lh3.googleusercontent.com", "lh5.googleusercontent.com", "googleusercontent.com"],
  },
};

export default nextConfig;
