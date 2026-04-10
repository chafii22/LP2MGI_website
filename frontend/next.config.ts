import type { NextConfig } from "next";

const configuredBackendOrigin = process.env.NEXT_BACKEND_ORIGIN?.trim() || "http://127.0.0.1:8000";
const backendOrigin = configuredBackendOrigin.replace(/\/$/, "");
const backendUrl = new URL(backendOrigin);
const backendProtocol = backendUrl.protocol === "https:" ? "https" : "http";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: backendProtocol,
        hostname: backendUrl.hostname,
        port: backendUrl.port,
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*/",
        destination: `${backendOrigin}/api/:path*/`,
      },
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*/`,
      },
    ];
  },
};

export default nextConfig;
