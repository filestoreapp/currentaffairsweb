"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { callWorker } from "@/lib/worker-client";

export interface ScrapeSummary {
  ranAt: string;
  results: {
    source: string;
    label: string;
    fetched: number;
    inserted: number;
    error: string | null;
  }[];
  totalInserted: number;
}

/**
 * Manual "Run scrape now" button on /admin/psc-updates. Requires an
 * authenticated admin session, then hands the actual scrape to the
 * Koyeb backend worker — keralapsc.gov.in pages are slow and flaky,
 * and serverless timeouts made running the scraper on Vercel unreliable.
 */
export async function runPscScrapeAction(): Promise<ScrapeSummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const summary = await callWorker<ScrapeSummary>("psc-scrape");
  revalidatePath("/admin/psc-updates");
  revalidatePath("/psc-updates");
  return summary;
}
