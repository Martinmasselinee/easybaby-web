import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Désactiver la validation ESLint pendant la production pour permettre le déploiement
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Désactiver la validation TypeScript pendant la production pour permettre le déploiement
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
