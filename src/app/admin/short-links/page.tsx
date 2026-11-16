import Link from "next/link";
import { format } from "date-fns";
import {
  getShortLinkStats,
  isShortLinksConfigured,
  shortLinkUrl,
} from "@/lib/short-links";
import { createShortLinkAction } from "@/lib/actions/short-links";

export const dynamic = "force-dynamic";

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
  const links = configured
    ? await getShortLinkStats().catch(() => null)
    : null;

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
