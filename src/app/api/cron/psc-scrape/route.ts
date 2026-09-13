import { NextResponse, type NextRequest } from "next/server";
import { runPscScrape, scrapeAllSources } from "@/lib/psc-scraper/scrape";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // refuse to run unconfigured
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/**
 * GET /api/cron/psc-scrape
 * Triggered on a schedule by Vercel Cron (see vercel.json), which sends
 * `Authorization: Bearer $CRON_SECRET` automatically when CRON_SECRET is
 * set as an env var. Can also be called manually (e.g. from curl or the
 * admin "Run scrape now" button) with the same header.
 *
 * Add `?dry_run=1` to only fetch + parse every source without touching
 * the database or Telegram — useful for checking the scraper still
 * matches Kerala PSC's current page markup after they redesign something.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get("dry_run") === "1";

  if (dryRun) {
    const scraped = await scrapeAllSources();
    return NextResponse.json({
      dryRun: true,
      results: scraped.map(({ source, items, error }) => ({
        source: source.key,
        label: source.label,
        fetched: items.length,
        error,
        sample: items.slice(0, 3),
      })),
    });
  }

  const summary = await runPscScrape();
  return NextResponse.json(summary);
}
