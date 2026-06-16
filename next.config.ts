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
        hostname: "static.marham.pk",
      },
      {
        protocol: "https",
        hostname: "staticconnect.marham.pk",
      },
    ],
  },
  allowedDevOrigins: ['10.1.2.205']
}

export default nextConfig
