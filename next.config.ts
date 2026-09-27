import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        // GitHub-backed image CDN (legacy Supabase storage above)
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
    ],
  },
  // Bundle the yt-dlp standalone binary (downloaded by postinstall into
  // ./bin) into the /api/dl/extract serverless function so Instagram
  // extraction can spawn it at runtime.
  outputFileTracingIncludes: {
    "/api/dl/extract": ["./bin/yt-dlp"],
  },
};

export default nextConfig;
