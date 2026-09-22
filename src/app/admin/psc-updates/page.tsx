import { getLatestPscUpdates, getPscUpdateCountsBySource } from "@/lib/psc-updates";
import { PSC_SOURCES } from "@/lib/psc-scraper/sources";
import RunPscScrapeButton from "@/components/admin/RunPscScrapeButton";

export default async function AdminPscUpdatesPage() {
  const [updates, counts] = await Promise.all([
    getLatestPscUpdates({ limit: 15 }),
    getPscUpdateCountsBySource(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">PSC Auto-Updates</h1>
          <p className="mt-1 text-sm text-slate-500">
            Scrapes keralapsc.gov.in for notifications, syllabus, exam
            programme, results and more. Runs automatically on the schedule
            in <code className="rounded bg-slate-100 px-1">vercel.json</code>,
            or trigger it manually below.
          </p>
        </div>
        <RunPscScrapeButton />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PSC_SOURCES.map((s) => (
          <div key={s.key} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {counts[s.key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-bold">Most recently scraped</h2>
      {updates.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Nothing scraped yet.</p>
      ) : (
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Published</th>
                <th className="px-3 py-2">Scraped</th>
                <th className="px-3 py-2">Telegram</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {updates.map((u) => (
                <tr key={u.id}>
                  <td className="max-w-xs truncate px-3 py-2 font-medium text-slate-800">
                    <a
                      href={u.pdf_url || u.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600"
                    >
                      {u.title}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {PSC_SOURCES.find((s) => s.key === u.source)?.label ?? u.source}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {u.published_on ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {new Date(u.scraped_at).toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-2">
                    {u.telegram_posted ? (
                      <span className="text-emerald-600">Sent</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
