import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "staticdev.marham.pk",
      },
    ],
  },
  allowedDevOrigins: ['10.1.2.205']
}

export default nextConfig
