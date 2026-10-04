import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://www.psccurrentaffairs.online";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/search", "/api", "/expenses"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
