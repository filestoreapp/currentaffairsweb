import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

export async function getTopPosts(limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, category:categories(*)")
    .order("views", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as Post[];
}

export async function getTotalPostViews() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select("views");
  if (error) throw error;
  return (data ?? []).reduce((sum, p) => sum + (p.views ?? 0), 0);
}

export async function getVisitsOverTime(days = 30) {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("page_views")
    .select("created_at")
    .gte("created_at", since.toISOString());
  if (error) throw error;

  // Build a zero-filled map for the last N days, then count into it.
  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    counts.set(d.toISOString().slice(0, 10), 0);
  }

  for (const row of data ?? []) {
    const day = row.created_at.slice(0, 10);
    if (counts.has(day)) counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([date, visits]) => ({
    date,
    visits,
  }));
}

/** Published/draft post counts, category count, and tracked PSC update count — the "Content overview" cards. */
export async function getContentCounts() {
  const supabase = await createClient();

  const [{ count: publishedPosts }, { count: draftPosts }, { count: categories }, { count: pscUpdates }] =
    await Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("psc_updates").select("*", { count: "exact", head: true }),
    ]);

  return {
    publishedPosts: publishedPosts ?? 0,
    draftPosts: draftPosts ?? 0,
    categories: categories ?? 0,
    pscUpdates: pscUpdates ?? 0,
  };
}

/** Total views + post count for each category, for the "Views by Category" bars. */
export async function getViewsByCategory() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("views, category:categories(name)")
    .eq("status", "published");
  if (error) throw error;

  const byCategory = new Map<string, { views: number; posts: number }>();
  for (const row of data ?? []) {
    const categoryName = Array.isArray(row.category)
      ? (row.category[0] as { name?: string } | undefined)?.name
      : (row.category as { name?: string } | null)?.name;
    const name = categoryName ?? "Uncategorized";
    const existing = byCategory.get(name);
    if (existing) {
      existing.views += row.views ?? 0;
      existing.posts += 1;
    } else {
      byCategory.set(name, { views: row.views ?? 0, posts: 1 });
    }
  }

  return Array.from(byCategory.entries())
    .map(([name, v]) => ({ name, views: v.views, posts: v.posts }))
    .sort((a, b) => b.views - a.views);
}

/** Most-visited paths (from page_views) over the last `days` days, for the "Top Pages" list. */
export async function getTopPages(days = 30, limit = 8) {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("page_views")
    .select("path")
    .gte("created_at", since.toISOString());
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.path, (counts.get(row.path) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

/** Day-by-day published-post count for the last `days` days — how active publishing has been. */
export async function getPostsPublishedOverTime(days = 30) {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("posts")
    .select("published_at")
    .eq("status", "published")
    .gte("published_at", since.toISOString());
  if (error) throw error;

  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    counts.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of data ?? []) {
    if (!row.published_at) continue;
    const day = row.published_at.slice(0, 10);
    if (counts.has(day)) counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([date, posts]) => ({ date, posts }));
}

/** Average views per published post, and the split between posts with zero views vs. some traffic. */
export async function getEngagementSummary() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("views")
    .eq("status", "published");
  if (error) throw error;

  const rows = data ?? [];
  const totalViews = rows.reduce((sum, p) => sum + (p.views ?? 0), 0);
  const withViews = rows.filter((p) => (p.views ?? 0) > 0).length;

  return {
    avgViewsPerPost: rows.length ? Math.round(totalViews / rows.length) : 0,
    postsWithViews: withViews,
    postsWithNoViews: rows.length - withViews,
  };
}
