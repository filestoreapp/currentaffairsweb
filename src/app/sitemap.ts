import type { MetadataRoute } from "next";
import { getPublishedPosts, getAllCategories } from "@/lib/posts";
import { getPublishedMocks, getPublishedPyqs, getPublishedQuizzes } from "@/lib/quizzes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // If Supabase is unreachable at build time, still ship a minimal sitemap
  // rather than failing the whole deploy over this one route.
  let posts: Awaited<ReturnType<typeof getPublishedPosts>>["posts"] = [];
  let categories: Awaited<ReturnType<typeof getAllCategories>> = [];
  let mocks: Awaited<ReturnType<typeof getPublishedMocks>> = [];
  let pyqs: Awaited<ReturnType<typeof getPublishedPyqs>> = [];
  let quizzes: Awaited<ReturnType<typeof getPublishedQuizzes>> = [];
  try {
    const result = await getPublishedPosts({ perPage: 1000 });
    posts = result.posts;
    categories = await getAllCategories();
    mocks = await getPublishedMocks();
    pyqs = await getPublishedPyqs();
    quizzes = await getPublishedQuizzes();
  } catch (err) {
    console.error("sitemap: failed to fetch posts/categories", err);
  }

  return [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/current-affairs`, lastModified: new Date() },
    { url: `${siteUrl}/quiz`, lastModified: new Date() },
    { url: `${siteUrl}/mock-tests`, lastModified: new Date() },
    { url: `${siteUrl}/pyqs`, lastModified: new Date() },
    { url: `${siteUrl}/syllabus`, lastModified: new Date() },
    { url: `${siteUrl}/about`, lastModified: new Date() },
    { url: `${siteUrl}/contact`, lastModified: new Date() },
    { url: `${siteUrl}/privacy`, lastModified: new Date() },
    ...mocks.map((m) => ({
      url: `${siteUrl}/mock-tests/${m.slug}`,
      lastModified: new Date(m.created_at),
    })),
    ...quizzes.map((q) => ({
      url: `${siteUrl}/quiz/${q.slug}`,
      lastModified: new Date(q.updated_at ?? q.created_at),
    })),
    ...pyqs.map((p) => ({
      url: `${siteUrl}/pyqs/${p.slug}`,
      lastModified: new Date(p.created_at),
    })),
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
