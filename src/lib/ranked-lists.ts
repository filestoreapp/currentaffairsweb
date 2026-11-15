import fs from "node:fs";
import path from "node:path";
import type { CutoffRow } from "@/lib/rank-cutoffs";
import { categoryFromSlug } from "@/lib/rank-cutoffs";

export { categorySlug, categoryFromSlug } from "@/lib/rank-cutoffs";

/**
 * Ranked-list search index.
 *
 * Data source: src/data/ranked-lists-seed.json — parsed from the official
 * PSC ranked-list PDFs (keralapsc.gov.in). The same data also lives in
 * Supabase (see supabase/migrations/20261115_ranked_lists.sql + the seed
 * SQL) once the user applies those files in the SQL Editor; until then the
 * bundled seed is the live index and the daily ranked-list-indexer cron
 * keeps it growing.
 *
 * Privacy: date of birth is never stored. Searchable fields are exactly
 * what the public PDFs print: rank, register/serial number, name, marks,
 * community, list section.
 */

export interface RankedListMeta {
  id: string;
  category: string | null;
  post: string | null;
  list_no: string | null;
  published_on: string | null;
  pdf_url: string;
  entries: number;
  main_count: number;
  footer_total: number | null;
  has_marks: boolean;
}

export interface RankedListEntry {
  rank: number;
  regno: string;
  name: string;
  total: number | null;
  community: string | null;
  section: string;
  list: RankedListMeta;
}

interface SeedData {
  generated_at: string;
  lists: RankedListMeta[];
  /** [list_idx, rank, regno, name, total, community, section] */
  entries: [number, number, string, string, number | null, string | null, string][];
  cutoffs: CutoffRow[];
}

let cached: SeedData | null = null;

export function loadSeed(): SeedData {
  if (!cached) {
    const file = path.join(process.cwd(), "src", "data", "ranked-lists-seed.json");
    cached = JSON.parse(fs.readFileSync(file, "utf-8")) as SeedData;
  }
  return cached;
}

export function getRankedLists(): RankedListMeta[] {
  const { lists } = loadSeed();
  return [...lists].sort((a, b) =>
    (b.published_on ?? "").localeCompare(a.published_on ?? "")
  );
}

export function getCutoffs(): CutoffRow[] {
  return loadSeed().cutoffs;
}

export function getCutoffsByCategory(category: string): CutoffRow[] {
  return loadSeed().cutoffs.filter((c) => c.category === category);
}

export function getCategoryData(slug: string) {
  const category = categoryFromSlug(slug);
  const seed = loadSeed();
  const lists = seed.lists
    .filter((l) => l.category === category)
    .sort((a, b) => (b.published_on ?? "").localeCompare(a.published_on ?? ""));
  if (lists.length === 0) return null;
  return {
    category,
    post: lists[0].post,
    lists,
    cutoffs: getCutoffsByCategory(category),
  };
}

/** One ranked list by its seed id, with its candidates (by rank) and cut-offs. */
export function getRankedListById(id: string) {
  const seed = loadSeed();
  const idx = seed.lists.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  const meta = seed.lists[idx];
  const entries: RankedListEntry[] = seed.entries
    .filter(([li]) => li === idx)
    .map(([, rank, regno, name, total, community, section]) => ({
      rank,
      regno,
      name,
      total,
      community,
      section,
      list: meta,
    }))
    .sort((a, b) => a.rank - b.rank);
  const cutoffs = meta.list_no
    ? seed.cutoffs.filter((c) => c.list_no === meta.list_no)
    : [];
  return { meta, entries, cutoffs };
}

/** Cut-offs for one list number (official PSC figures; marks may be null). */
export function getCutoffsByListNo(listNo: string): CutoffRow[] {
  return loadSeed().cutoffs.filter((c) => c.list_no === listNo);
}

export function getCategories(): { category: string; post: string | null; lists: number; entries: number }[] {
  const seed = loadSeed();
  const map = new Map<string, { post: string | null; lists: number; entries: number }>();
  for (const l of seed.lists) {
    if (!l.category) continue;
    const cur = map.get(l.category) ?? { post: l.post, lists: 0, entries: 0 };
    cur.lists += 1;
    cur.entries += l.entries;
    if (!cur.post) cur.post = l.post;
    map.set(l.category, cur);
  }
  return [...map.entries()]
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

const MALAYALAM_RE = /[\u0D00-\u0D7F]/;

export interface SearchResult {
  entries: RankedListEntry[];
  malayalamHint: boolean;
  totalIndexed: number;
}

/** Find a name or register number across all indexed ranked lists. */
export function searchRankedLists(query: string, limit = 50): SearchResult {
  const seed = loadSeed();
  const q = query.trim();
  if (!q) return { entries: [], malayalamHint: false, totalIndexed: seed.entries.length };

  // Ranked lists print names in English (as published by PSC). A Malayalam
  // query cannot match them — say so instead of returning nothing silently.
  if (MALAYALAM_RE.test(q)) {
    return { entries: [], malayalamHint: true, totalIndexed: seed.entries.length };
  }

  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const nq = norm(q);
  const isRegno = /^[0-9]+$/.test(nq);

  const out: RankedListEntry[] = [];
  for (const [li, rank, regno, name, total, community, section] of seed.entries) {
    let hit = false;
    if (isRegno) {
      hit = regno === nq;
    } else {
      const nn = norm(name);
      hit = nq.split(" ").every((w) => w.length > 0 && nn.includes(w));
    }
    if (!hit) continue;
    out.push({
      rank,
      regno,
      name,
      total,
      community,
      section,
      list: seed.lists[li],
    });
    if (out.length >= limit) break;
  }

  // Most recent list first, then best rank.
  out.sort(
    (a, b) =>
      (b.list.published_on ?? "").localeCompare(a.list.published_on ?? "") ||
      a.rank - b.rank
  );
  return { entries: out, malayalamHint: false, totalIndexed: seed.entries.length };
}
