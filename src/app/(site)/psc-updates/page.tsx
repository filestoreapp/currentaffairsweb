import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { getLatestPscUpdates } from "@/lib/psc-updates";
import type { PscSourceKey } from "@/lib/types";
import { PSC_SOURCES } from "@/lib/psc-scraper/sources";

export const metadata = {
  title: "PSC Notifications & Updates",
};

export const revalidate = 900; // 15 min - these come from a scraper, not live traffic

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isNew(scrapedAt: string) {
  return Date.now() - new Date(scrapedAt).getTime() < 1000 * 60 * 60 * 48;
}

export default async function PscUpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const params = await searchParams;
  const activeSource = PSC_SOURCES.find((s) => s.key === params.source)?.key as
    | PscSourceKey
    | undefined;

  const updates = await getLatestPscUpdates({ source: activeSource, limit: 40 });

  return (
    <div>
      <h1 className="text-3xl font-extrabold">PSC Notifications &amp; Updates</h1>
      <p className="mt-2 text-slate-500">
        Auto-pulled from the official{" "}
        <a
          href="https://www.keralapsc.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-indigo-600"
        >
          keralapsc.gov.in
        </a>{" "}
        — notifications, syllabus, exam programme, results and more, refreshed
        automatically. Always verify against the official site before acting on
        any deadline.
      </p>

      <div className="scrollbar-hide mt-6 flex gap-2 overflow-x-auto pb-2">
        <Link
          href="/psc-updates"
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
            !activeSource
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          All
        </Link>
        {PSC_SOURCES.map((s) => (
          <Link
            key={s.key}
            href={`/psc-updates?source=${s.key}`}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
              activeSource === s.key
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {updates.length === 0 ? (
        <p className="mt-10 text-slate-500">
          No updates yet — the scraper hasn&apos;t run, or hasn&apos;t found
          anything new for this section.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {updates.map((u) => {
            const sourceLabel =
              PSC_SOURCES.find((s) => s.key === u.source)?.label ?? u.source;
            const date = formatDate(u.published_on);
            return (
              <li key={u.id} className="flex items-start justify-between gap-4 p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                      {sourceLabel}
                    </span>
                    {isNew(u.scraped_at) && (
                      <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                        NEW
                      </span>
                    )}
                    {date && <span className="text-xs text-slate-400">{date}</span>}
                  </div>
                  <p className="mt-1 font-medium text-slate-900">{u.title}</p>
                  {u.category_number && (
                    <p className="mt-0.5 text-xs text-slate-500">{u.category_number}</p>
                  )}
                </div>
                <a
                  href={u.pdf_url || u.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  {u.pdf_url ? (
                    <>
                      <Download size={14} /> PDF
                    </>
                  ) : (
                    <>
                      <ExternalLink size={14} /> Open
                    </>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
