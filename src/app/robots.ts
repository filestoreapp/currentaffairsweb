import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://www.psccurrentaffairs.online";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/search", "/api"] },
      // AI crawlers are explicitly welcome (2026-11-16): the site wants
      // its content cited by AI assistants. These four are NOT blocked.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
