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
};

async function withRewrites(config: NextConfig) {
  const prev = config.rewrites;
  config.rewrites = async () => {
    const base = prev ? await prev() : [];
    const extra = [
      // Freedom-fighter series: clean top-level URLs.
      { source: "/indian-freedom-fighters", destination: "/current-affairs/indian-freedom-fighters" },
      { source: "/freedom-fighter-:slug", destination: "/current-affairs/freedom-fighter-:slug" },
    ];
    return Array.isArray(base) ? [...extra, ...base] : { ...base, afterFiles: [...extra, ...(base.afterFiles || [])] };
  };
  return config;
}

export default withRewrites(nextConfig);
