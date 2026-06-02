import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Allow development connections from the local network IP
  allowedDevOrigins: ['192.168.2.101', 'localhost:3000', '192.168.2.101:3000'],
} as any;

export default nextConfig;
