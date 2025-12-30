import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sakay.to',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
