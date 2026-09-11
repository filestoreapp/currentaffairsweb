import { createClient } from "@/lib/supabase/server";
import type { PscSourceKey, PscUpdate } from "@/lib/types";

export async function getLatestPscUpdates({
  source,
  limit = 20,
}: {
  source?: PscSourceKey;
  limit?: number;
} = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("psc_updates")
    .select("*")
    .order("published_on", { ascending: false, nullsFirst: false })
    .order("scraped_at", { ascending: false })
    .limit(limit);

  if (source) query = query.eq("source", source);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PscUpdate[];
}

export async function getPscUpdateCountsBySource() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("psc_updates").select("source");
  if (error) throw error;

  const counts: Partial<Record<PscSourceKey, number>> = {};
  for (const row of data ?? []) {
    const key = row.source as PscSourceKey;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export async function getPscUpdateTotalCount() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("psc_updates")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}
