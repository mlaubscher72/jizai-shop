import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone-Output für Docker/VPS-Deployments; auf Vercel nicht nötig
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
