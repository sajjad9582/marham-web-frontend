import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["typeorm", "mysql2", "reflect-metadata"],
  experimental: {
    serverMinification: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "staticdev.marham.pk",
      },
      {
        protocol: "https",
        hostname: "staticconnectdev.marham.pk",
      },
    ],
  },
  allowedDevOrigins: ['10.1.2.205']
}

export default nextConfig
