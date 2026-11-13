import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
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

async function fetchAllPageViews(since: string) {
  // PostgREST silently caps a single query at 1000 rows. The site passed that
  // long ago, so every unbounded page_views read must page through all rows.
  //
  // page_views SELECT is granted only to `authenticated` (see supabase/schema.sql),
  // so the cookie-aware anon client returns zero rows for signed-out viewers
  // and the stats page showed 0 visits even while traffic grew. Read through
  // the service-role client so the numbers are truthful regardless of sign-in.
  // If SUPABASE_SERVICE_ROLE_KEY is unset (local dev), fall back to the
  // session client: a signed-in admin still sees real numbers.
  let supabase: SupabaseClient;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }
  const PAGE = 1000;
  const rows: { created_at: string; path: string }[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("page_views")
      .select("created_at, path")
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < PAGE) break;
    from += PAGE;
  }
  return rows;
}

export async function getVisitsOverTime(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const data = await fetchAllPageViews(since.toISOString());

  // Build a zero-filled map for the last N days, then count into it.
  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    counts.set(d.toISOString().slice(0, 10), 0);
  }

  for (const row of data) {
    const day = row.created_at.slice(0, 10);
    if (counts.has(day)) counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  // Merge the daily rollup (disjoint from raw rows — see getTopPages).
  const daily = await fetchDailyPageViews(since.toISOString().slice(0, 10));
  for (const row of daily ?? []) {
    if (counts.has(row.day)) counts.set(row.day, (counts.get(row.day) ?? 0) + row.views);
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
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const data = await fetchAllPageViews(since.toISOString());

  const counts = new Map<string, number>();
  for (const row of data) {
    counts.set(row.path, (counts.get(row.path) ?? 0) + 1);
  }
  // Merge the daily rollup: page_view_daily holds exactly the raw rows that
  // were rolled up and deleted, so the two sources are disjoint — summing is
  // exact. A missing table (migration pending) just means raw-only.
  const daily = await fetchDailyPageViews(since.toISOString().slice(0, 10));
  for (const row of daily ?? []) {
    counts.set(row.path, (counts.get(row.path) ?? 0) + row.views);
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

// =========================================================
// LIFETIME VISITS (page_view_daily rollup)
// =========================================================
// page_views only keeps recent rows: the hourly rollup aggregates rows
// older than 90 days into page_view_daily (one row per UTC day + path)
// and deletes those raw rows. The two sources are disjoint by
// construction, so lifetime totals are exact sums of both.
// A null return from fetchDailyPageViews means the rollup table doesn't
// exist yet (migration pending) — callers fall back to raw rows.

/** Paged read of the daily rollup table. Null when unreadable (no service
 * key, or the table doesn't exist yet). */
async function fetchDailyPageViews(
  sinceDay?: string
): Promise<{ day: string; path: string; views: number }[] | null> {
  let supabase: SupabaseClient;
  try {
    supabase = createAdminClient();
  } catch {
    return null;
  }
  const PAGE = 1000;
  const rows: { day: string; path: string; views: number }[] = [];
  let from = 0;
  for (;;) {
    let q = supabase
      .from("page_view_daily")
      .select("day, path, views")
      .order("day", { ascending: true })
      .range(from, from + PAGE - 1);
    if (sinceDay) q = q.gte("day", sinceDay);
    const { data, error } = await q;
    if (error) return null;
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < PAGE) break;
    from += PAGE;
  }
  return rows;
}

async function countRawPageViews(since?: string): Promise<number | null> {
  let supabase: SupabaseClient;
  try {
    supabase = createAdminClient();
  } catch {
    return null;
  }
  let q = supabase.from("page_views").select("*", { count: "exact", head: true });
  if (since) q = q.gte("created_at", since);
  const { count, error } = await q;
  if (error) return null;
  return count ?? 0;
}

/** Lifetime visits = daily rollup total + remaining raw rows.
 * `migrated` is false while the rollup table doesn't exist yet (the total
 * then falls back to the raw count, which is all the history retained). */
export async function getLifetimeVisits(): Promise<{
  total: number;
  migrated: boolean;
} | null> {
  const [daily, raw] = await Promise.all([
    fetchDailyPageViews(),
    countRawPageViews(),
  ]);
  if (daily === null && raw === null) return null;
  if (daily === null) return { total: raw ?? 0, migrated: false };
  const dailyTotal = daily.reduce((sum, r) => sum + r.views, 0);
  return { total: dailyTotal + (raw ?? 0), migrated: true };
}

/** Lifetime top pages, merged from the daily rollup + raw rows. */
export async function getLifetimeTopPages(limit = 8): Promise<{
  pages: { path: string; views: number }[];
  migrated: boolean;
} | null> {
  const daily = await fetchDailyPageViews();
  let raw: { created_at: string; path: string }[];
  try {
    raw = await fetchAllPageViews("1970-01-01T00:00:00.000Z");
  } catch {
    return null;
  }
  const counts = new Map<string, number>();
  for (const row of daily ?? []) {
    counts.set(row.path, (counts.get(row.path) ?? 0) + row.views);
  }
  for (const row of raw) {
    counts.set(row.path, (counts.get(row.path) ?? 0) + 1);
  }
  const pages = Array.from(counts.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
  return { pages, migrated: daily !== null };
}

/** Visits in the last `days` days, merged from daily rollup + raw rows.
 * Falls back to raw-only while the rollup table doesn't exist yet (raw
 * then still holds the full retained history, so the number stays right). */
export async function getVisitsInLastDays(days = 30): Promise<number | null> {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);
  const sinceIso = since.toISOString();

  const daily = await fetchDailyPageViews(sinceIso.slice(0, 10));
  let total = 0;
  let ok = false;
  if (daily !== null) {
    total += daily.reduce((sum, r) => sum + r.views, 0);
    ok = true;
  }
  try {
    const raw = await fetchAllPageViews(sinceIso);
    total += raw.length;
    ok = true;
  } catch {
    // No service key / no session client: keep whatever the daily table gave.
  }
  return ok ? total : null;
}
