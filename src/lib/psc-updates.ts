import { createPublicClient } from "@/lib/supabase/public";
import type { PscSourceKey, PscUpdate } from "@/lib/types";

export async function getLatestPscUpdates({
  source,
  limit = 20,
}: {
  source?: PscSourceKey;
  limit?: number;
} = {}) {
  const supabase = createPublicClient();
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

export async function getPscUpdateById(id: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("psc_updates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as PscUpdate | null;
}

export async function getPscUpdateCountsBySource() {
  const supabase = createPublicClient();
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
  const supabase = createPublicClient();
  const { count, error } = await supabase
    .from("psc_updates")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

/** Paginated Short Lists (source = "shortlists"), newest first. */
export async function getShortlistsPage(page = 1, perPage = 24) {
  const supabase = createPublicClient();
  const safePage = Math.max(1, Math.floor(page) || 1);
  const from = (safePage - 1) * perPage;
  const { data, count, error } = await supabase
    .from("psc_updates")
    .select("*", { count: "exact" })
    .eq("source", "shortlists")
    .order("published_on", { ascending: false, nullsFirst: false })
    .order("scraped_at", { ascending: false })
    .range(from, from + perPage - 1);
  if (error) throw error;
  return {
    updates: (data ?? []) as PscUpdate[],
    total: count ?? 0,
    page: safePage,
    perPage,
  };
}

/** One Short List by id, or null when the row is missing / not a shortlist. */
export async function getShortlistById(id: string) {
  const update = await getPscUpdateById(id);
  if (!update || update.source !== "shortlists") return null;
  return update;
}
