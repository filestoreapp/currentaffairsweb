"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { runPscScrape, type ScrapeSummary } from "@/lib/psc-scraper/scrape";

/**
 * Manual "Run scrape now" button on /admin/psc-updates. Requires an
 * authenticated admin session — this runs the scraper directly (with the
 * service-role client inside runPscScrape), it doesn't call the public
 * cron route, so it works even without CRON_SECRET configured.
 */
export async function runPscScrapeAction(): Promise<ScrapeSummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const summary = await runPscScrape();
  revalidatePath("/admin/psc-updates");
  revalidatePath("/psc-updates");
  return summary;
}
