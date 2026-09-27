import Link from "next/link";
import { ExternalLink, Newspaper } from "lucide-react";
import { getDigestPosts } from "@/lib/actions/digest";
import DigestRowActions from "@/components/admin/DigestRowActions";

export const dynamic = "force-dynamic";

/** News portals the worker scrapes every morning for the digest. */
const NEWS_SOURCES = [
  { name: "Mathrubhumi", url: "https://www.mathrubhumi.com/" },
  { name: "Malayala Manorama", url: "https://www.manoramaonline.com/" },
  { name: "Deshabhimani", url: "https://www.deshabhimani.com/" },
  { name: "Madhyamam", url: "https://www.madhyamam.com/" },
];

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    draft: "bg-amber-100 text-amber-800",
    published: "bg-emerald-100 text-emerald-800",
    scheduled: "bg-blue-100 text-blue-800",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function istDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function AdminDigestPage() {
  const digests = await getDigestPosts();
  const drafts = digests.filter((d) => d.status === "draft");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight">
            <Newspaper size={28} className="text-indigo-600" />
            Daily Digest
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Every morning at 7:00 AM IST the worker scrapes the Malayalam news
            portals below and a Malayalam digest is composed as a{" "}
            <strong>draft</strong>. Nothing publishes until you approve it —
            publish a draft here or reply YES in chat when the digest arrives.
            Publishing generates the branded thumbnail and announces the post
            on Telegram.
          </p>
        </div>
        {drafts.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
            <p className="font-semibold text-amber-800">
              {drafts.length} draft{drafts.length > 1 ? "s" : ""} awaiting your
              approval
            </p>
          </div>
        )}
      </div>

      <h2 className="mt-8 text-lg font-bold">News sources</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {NEWS_SOURCES.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300"
          >
            <p className="text-sm font-semibold text-slate-800">{s.name}</p>
            <ExternalLink size={14} className="text-slate-400" />
          </a>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-bold">Digests</h2>
      {digests.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          No digests yet. The first one will be drafted tomorrow at 7:00 AM
          IST.
        </p>
      ) : (
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {digests.map((d) => (
                <tr key={d.id}>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-500">
                    {istDate(d.created_at)}
                  </td>
                  <td className="max-w-xs truncate px-3 py-2 font-medium text-slate-800">
                    {d.status === "published" ? (
                      <Link
                        href={`/current-affairs/${d.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-indigo-600"
                      >
                        {d.title}
                      </Link>
                    ) : (
                      d.title
                    )}
                  </td>
                  <td className="px-3 py-2">{statusBadge(d.status)}</td>
                  <td className="px-3 py-2">
                    <DigestRowActions
                      id={d.id}
                      slug={d.slug}
                      status={d.status}
                    />
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
