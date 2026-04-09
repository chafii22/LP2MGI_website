import type { NextConfig } from "next";

const configuredBackendOrigin = process.env.NEXT_BACKEND_ORIGIN?.trim() || "http://127.0.0.1:8000";
const backendOrigin = configuredBackendOrigin.replace(/\/$/, "");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  skipTrailingSlashRedirect: true,
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
