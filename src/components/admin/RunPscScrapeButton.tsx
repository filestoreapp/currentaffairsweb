"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { runPscScrapeAction } from "@/lib/actions/psc-scrape";
import type { ScrapeSummary } from "@/lib/psc-scraper/scrape";

export default function RunPscScrapeButton() {
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<ScrapeSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const result = await runPscScrapeAction();
              setSummary(result);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Scrape failed");
            }
          });
        }}
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        <RefreshCw size={16} className={isPending ? "animate-spin" : ""} />
        {isPending ? "Scraping keralapsc.gov.in…" : "Run scrape now"}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {summary && (
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Fetched</th>
                <th className="px-3 py-2">New</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.results.map((r) => (
                <tr key={r.source}>
                  <td className="px-3 py-2 font-medium text-slate-800">{r.label}</td>
                  <td className="px-3 py-2">{r.fetched}</td>
                  <td className="px-3 py-2">
                    {r.inserted > 0 ? (
                      <span className="font-semibold text-emerald-600">
                        +{r.inserted}
                      </span>
                    ) : (
                      0
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {r.error ? (
                      <span className="text-red-600">{r.error}</span>
                    ) : (
                      <span className="text-slate-400">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            {summary.totalInserted} new item(s) added ·{" "}
            {new Date(summary.ranAt).toLocaleString("en-IN")}
          </p>
        </div>
      )}
    </div>
  );
}
