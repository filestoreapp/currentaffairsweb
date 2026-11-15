import type { Metadata } from "next";
import EmbedPoweredBy from "@/components/site/EmbedPoweredBy";
import { getLatestPscUpdates } from "@/lib/psc-updates";
import { PSC_SOURCES } from "@/lib/psc-sources";
import { siteUrl } from "@/lib/seo";

/**
 * Embeddable PSC notifications feed — the latest official updates as a
 * plain server-rendered list. No client JS, no auth, no user data; every
 * item links out to the official PSC source (or the site's update page).
 * Widget endpoints are noindex (they duplicate /psc-updates); the /embed
 * hub page is the discoverable one.
 */

export const revalidate = 900;

export const metadata: Metadata = {
  title: "PSC Notifications — Kerala PSC Current Affairs",
  robots: { index: false, follow: false },
};

export default async function EmbedUpdatesPage() {
  const updates = await getLatestPscUpdates({ limit: 10 });

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-200 px-4 py-3">
        <p className="text-sm font-bold text-slate-800">
          📢 Kerala PSC — Latest Notifications
        </p>
      </header>
      <main className="flex-1 px-4 py-3">
        {updates.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No updates right now — check back soon.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {updates.map((u) => (
              <li key={u.id} className="py-2.5">
                <a
                  href={u.pdf_url ?? u.source_url ?? `${siteUrl()}/psc-updates`}
                  target="_blank"
                  rel="noopener"
                  className="block text-sm font-medium leading-snug text-slate-800 hover:text-indigo-700"
                >
                  {u.title}
                </a>
                <p className="mt-0.5 text-xs text-slate-400">
                  {PSC_SOURCES.find((s) => s.key === u.source)?.label ?? u.source}
                  {u.published_on
                    ? ` · ${new Date(u.published_on).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
      <EmbedPoweredBy href={`${siteUrl()}/psc-updates`} />
    </div>
  );
}
