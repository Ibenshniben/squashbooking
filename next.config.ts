import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: [
        "5f6f-84-49-215-125.ngrok-free.app", 
        "localhost:3000",
        "*.vercel.app" // Allows all Vercel preview and production deployments
      ]
    }
  }
};

export default nextConfig;
