import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["mysql2"],
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
