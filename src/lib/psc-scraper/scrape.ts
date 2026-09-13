import { createAdminClient } from "@/lib/supabase/admin";
import { postPscUpdateToTelegram } from "@/lib/telegram";
import type { PscUpdate } from "@/lib/types";
import { PSC_SOURCES } from "./sources";
import { parseLinkListPage, parseTablePage, type ScrapedItem } from "./parse";

export interface SourceResult {
  source: string;
  label: string;
  fetched: number;
  inserted: number;
  error: string | null;
}

export interface ScrapeSummary {
  ranAt: string;
  results: SourceResult[];
  totalInserted: number;
}

async function fetchSourceHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    // A plain fetch UA gets blocked by some gov.in sites' bot protection.
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    // Always hit the live page — this route is only ever called by cron
    // or an explicit admin action, so caching would just hide new posts.
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`${url} responded ${res.status}`);
  }
  return res.text();
}

/** Fetches and parses every configured source. Does not touch the database. */
export async function scrapeAllSources(): Promise<
  { source: (typeof PSC_SOURCES)[number]; items: ScrapedItem[]; error: string | null }[]
> {
  return Promise.all(
    PSC_SOURCES.map(async (source) => {
      try {
        const html = await fetchSourceHtml(source.url);
        const items =
          source.layout === "table"
            ? parseTablePage(html, source.key)
            : parseLinkListPage(html, source.key);
        return { source, items, error: null };
      } catch (err) {
        return {
          source,
          items: [] as ScrapedItem[],
          error: err instanceof Error ? err.message : "Unknown scrape error",
        };
      }
    })
  );
}

/**
 * Full run: scrape every source, insert rows that aren't already in
 * `psc_updates` (deduped by source_url), and push newly-inserted rows to
 * Telegram. Safe to call repeatedly — re-runs are cheap no-ops for
 * anything already stored.
 */
export async function runPscScrape(): Promise<ScrapeSummary> {
  const supabase = createAdminClient();
  const scraped = await scrapeAllSources();
  const results: SourceResult[] = [];
  let totalInserted = 0;

  for (const { source, items, error } of scraped) {
    if (error || items.length === 0) {
      results.push({
        source: source.key,
        label: source.label,
        fetched: items.length,
        inserted: 0,
        error,
      });
      continue;
    }

    const urls = items.map((i) => i.source_url);
    const { data: existing, error: selectError } = await supabase
      .from("psc_updates")
      .select("source_url")
      .in("source_url", urls);

    if (selectError) {
      results.push({
        source: source.key,
        label: source.label,
        fetched: items.length,
        inserted: 0,
        error: selectError.message,
      });
      continue;
    }

    const existingUrls = new Set((existing ?? []).map((r) => r.source_url as string));
    const newItems = items.filter((i) => !existingUrls.has(i.source_url));

    if (newItems.length === 0) {
      results.push({
        source: source.key,
        label: source.label,
        fetched: items.length,
        inserted: 0,
        error: null,
      });
      continue;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("psc_updates")
      .insert(
        newItems.map((i) => ({
          source: i.source,
          title: i.title,
          source_url: i.source_url,
          pdf_url: i.pdf_url,
          category_number: i.category_number,
          published_on: i.published_on,
        }))
      )
      .select();

    if (insertError) {
      results.push({
        source: source.key,
        label: source.label,
        fetched: items.length,
        inserted: 0,
        error: insertError.message,
      });
      continue;
    }

    const insertedRows = (inserted ?? []) as PscUpdate[];
    totalInserted += insertedRows.length;

    for (const row of insertedRows) {
      const result = await postPscUpdateToTelegram(row);
      if (result.ok) {
        await supabase
          .from("psc_updates")
          .update({ telegram_posted: true })
          .eq("id", row.id);
      }
    }

    results.push({
      source: source.key,
      label: source.label,
      fetched: items.length,
      inserted: insertedRows.length,
      error: null,
    });
  }

  return { ranAt: new Date().toISOString(), results, totalInserted };
}
