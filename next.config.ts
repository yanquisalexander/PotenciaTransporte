import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['typeorm'],
  experimental: {
    serverMinification: false,
  },
  images: {
    domains: ['i.ibb.co'],
  },
};

export default nextConfig;
