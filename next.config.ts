import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "index, follow" }],
      },
    ]
  },
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
