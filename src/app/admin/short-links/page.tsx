import Link from "next/link";
import { format } from "date-fns";
import {
  getShortLinkInsights,
  getShortLinkStats,
  isShortLinksConfigured,
  shortLinkUrl,
} from "@/lib/short-links";
import { createShortLinkAction } from "@/lib/actions/short-links";

export const dynamic = "force-dynamic";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-11-17" -> "17 Nov" (parsed as a plain date, never shifted by TZ). */
function dayLabel(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

/** "2026-11-17" -> "17 Nov 2026". */
function dayLabelFull(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/**
 * Admin: short links for Telegram posts.
 * Create-a-link form + every link with total clicks and last-7-days clicks.
 * Counts come from the separate Neon database (never the site's Supabase).
 * Signed-in admin session is enforced by the admin middleware, which
 * redirects signed-out visitors to /admin/login.
 */
export default async function ShortLinksAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const params = await searchParams;
  const configured = isShortLinksConfigured();
  const [links, insights] = await Promise.all([
    configured ? getShortLinkStats().catch(() => null) : Promise.resolve(null),
    configured
      ? getShortLinkInsights().catch(() => null)
      : Promise.resolve(null),
  ]);
  const maxDaily = insights
    ? Math.max(1, ...insights.daily_14.map((d) => d.clicks))
    : 1;

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Short Links</h1>
      <p className="mt-2 text-sm text-slate-600">
        Short /go/ links for Telegram posts. Each click is counted in the
        separate Neon database, so you can see how many visits each Telegram
        post drives.
      </p>

      {params.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </p>
      )}
      {params.created && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Short link created.
        </p>
      )}
      {!configured && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Not configured yet: add NEON_DATABASE_URL in Vercel (Production)
          and redeploy before links can be created or counted.
        </p>
      )}
      {configured && !insights && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Insights unavailable — could not load click counts from Neon.
        </p>
      )}

      {insights && (
        <section className="mt-6">
          <h2 className="text-lg font-bold">Insights at a glance</h2>
          <p className="mt-1 text-xs text-slate-500">
            All dates in IST. Counts come from the Neon database.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Total clicks", value: insights.total_clicks },
              { label: "Clicks today", value: insights.clicks_today },
              { label: "Last 7 days", value: insights.clicks_7d },
              { label: "Last 30 days", value: insights.clicks_30d },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {c.label}
                </p>
                <p className="mt-1 text-3xl font-extrabold">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold">Top links</h3>
              {insights.top_links.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No links yet.</p>
              ) : (
                <ol className="mt-2 space-y-2">
                  {insights.top_links.map((l, i) => (
                    <li
                      key={l.code}
                      className="flex items-baseline justify-between gap-2 text-sm"
                    >
                      <span className="min-w-0 truncate">
                        <span className="font-semibold text-slate-500">
                          {i + 1}.
                        </span>{" "}
                        <Link
                          href={shortLinkUrl(l.code)}
                          target="_blank"
                          className="font-medium text-sky-700 hover:underline"
                        >
                          /go/{l.code}
                        </Link>
                        {l.label && (
                          <span className="text-slate-500"> — {l.label}</span>
                        )}
                      </span>
                      <span className="shrink-0 font-semibold">
                        {l.total_clicks}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold">Best day &amp; average</h3>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Best day</dt>
                  <dd className="font-semibold">
                    {insights.best_day
                      ? `${dayLabelFull(insights.best_day.day)} — ${
                          insights.best_day.clicks
                        } clicks`
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">
                    Average / day (30 days)
                  </dt>
                  <dd className="font-semibold">
                    {insights.avg_per_day_30d}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Links with zero clicks</dt>
                  <dd className="font-semibold">
                    {insights.zero_click_links.length}
                  </dd>
                </div>
              </dl>
              {insights.zero_click_links.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {insights.zero_click_links.map((l) => (
                    <li key={l.code} className="truncate">
                      <Link
                        href={shortLinkUrl(l.code)}
                        target="_blank"
                        className="text-sky-700 hover:underline"
                      >
                        /go/{l.code}
                      </Link>
                      {l.label && (
                        <span className="text-slate-500"> — {l.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold">Daily clicks — last 14 days</h3>
            <ul className="mt-3 space-y-1.5">
              {insights.daily_14.map((d) => (
                <li key={d.day} className="flex items-center gap-2 text-sm">
                  <span className="w-14 shrink-0 text-xs text-slate-500">
                    {dayLabel(d.day)}
                  </span>
                  <span className="h-4 flex-1 overflow-hidden rounded bg-slate-100">
                    <span
                      className="block h-full rounded bg-sky-600"
                      style={{
                        width: `${
                          d.clicks === 0
                            ? 0
                            : Math.max(2, (d.clicks / maxDaily) * 100)
                        }%`,
                      }}
                    />
                  </span>
                  <span className="w-8 shrink-0 text-right font-semibold">
                    {d.clicks}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <form
        action={createShortLinkAction}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">
              Target URL
            </span>
            <input
              name="target_url"
              type="url"
              required
              placeholder="https://www.psccurrentaffairs.online/current-affairs/..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Must be a link on psccurrentaffairs.online (a full URL or a
              path like /mock-tests/...).
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Label</span>
            <input
              name="label"
              type="text"
              placeholder="e.g. kayyur-revolt-1941"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Custom alias (optional)
            </span>
            <input
              name="alias"
              type="text"
              placeholder="e.g. kayyur1941"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Letters, numbers, dashes and underscores. Leave blank for a
              random 6-character code.
            </span>
          </label>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Create short link
        </button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Short link</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Total clicks</th>
              <th className="px-4 py-3 text-right">Last 7 days</th>
            </tr>
          </thead>
          <tbody>
            {links === null && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  {configured
                    ? "Could not load click counts from Neon — check the database is up and the tables exist."
                    : "Short links are not configured yet."}
                </td>
              </tr>
            )}
            {links !== null && links.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No short links yet — create one above, or publish a post
                  and its Telegram announcement will mint one automatically.
                </td>
              </tr>
            )}
            {links?.map((l) => (
              <tr key={l.code} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={shortLinkUrl(l.code)}
                    target="_blank"
                    className="text-sky-700 hover:underline"
                  >
                    /go/{l.code}
                  </Link>
                </td>
                <td className="max-w-[280px] truncate px-4 py-3">
                  <Link
                    href={l.target_url}
                    target="_blank"
                    className="text-slate-600 hover:underline"
                    title={l.target_url}
                  >
                    {l.target_url.replace("https://www.psccurrentaffairs.online", "") || "/"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{l.label || "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {format(new Date(l.created_at), "dd MMM yyyy")}
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {l.total_clicks}
                </td>
                <td className="px-4 py-3 text-right">{l.clicks_7d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
