import type { MetadataRoute } from "next";
import { getPublishedPosts, getAllCategories } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { posts } = await getPublishedPosts({ perPage: 1000 });
  const categories = await getAllCategories();

  return [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/current-affairs`, lastModified: new Date() },
    ...categories.map((c) => ({
      url: `${siteUrl}/category/${c.slug}`,
      lastModified: new Date(c.created_at),
    })),
    ...posts.map((p) => ({
      url: `${siteUrl}/current-affairs/${p.slug}`,
      lastModified: new Date(p.updated_at),
    })),
  ];
}
