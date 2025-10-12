import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Désactiver ESLint pendant la compilation
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
