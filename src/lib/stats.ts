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
