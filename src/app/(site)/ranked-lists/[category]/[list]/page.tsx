import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FileText, Search, Trophy, ArrowLeft } from "lucide-react";
import {
  categorySlug,
  getRankedListById,
  getRankedLists,
} from "@/lib/ranked-lists";
import { communityLabel } from "@/lib/rank-cutoffs";
import { breadcrumbJsonLd, fitTitle, siteUrl } from "@/lib/seo";

/**
 * One ranked list, per notification/event — auto-generated from the same
 * bundled seed the search and cut-off pages read (src/data/ranked-lists-seed.json).
 * When the daily ranked-list-indexer adds a new list to the seed, this page
 * appears with it: no hand-building, no second copy of the data.
 * Only what the official PSC source states: exam, category, published date,
 * list number, candidate counts, cut-offs (marks shown only when published)
 * and the official PDF link. Never invented.
 */

export const revalidate = 300;

export async function generateStaticParams() {
  return getRankedLists()
    .filter((l) => l.category)
    .map((l) => ({
      category: categorySlug(l.category as string),
      list: l.id,
    }));
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00+05:30").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function shortDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso + "T00:00:00+05:30").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; list: string }>;
}): Promise<Metadata> {
  const { list } = await params;
  const data = getRankedListById(list);
  if (!data) return { title: "റാങ്ക് ലിസ്റ്റ്" };
  const { meta } = data;
  const title = fitTitle(
    `Kerala PSC Rank List ${meta.category ?? ""} — Result & Cut-off ${shortDate(meta.published_on)}`
  );
  const description =
    `${meta.post ?? "Kerala PSC ranked list"} — rank list ${meta.list_no ?? ""}, ` +
    `published ${fmtDate(meta.published_on)}. ${meta.entries} candidates, ` +
    `official PSC PDF, cut-off marks and candidate search.`;
  const url = `${siteUrl()}/ranked-lists/${categorySlug(meta.category ?? "")}/${meta.id}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

export default async function RankedListDetailPage({
  params,
}: {
  params: Promise<{ category: string; list: string }>;
}) {
  const { list } = await params;
  const data = getRankedListById(list);
  if (!data) notFound();
  const { meta, entries, cutoffs } = data;
  const catSlug = meta.category ? categorySlug(meta.category) : null;
  const top = entries.slice(0, 10);

  return (
    <div className="mx-auto max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Ranked Lists", path: "/ranked-lists" },
              ...(catSlug && meta.category
                ? [{ name: `കാറ്റഗറി ${meta.category}`, path: `/ranked-lists/${catSlug}` }]
                : []),
              { name: `റാങ്ക് ലിസ്റ്റ് ${meta.list_no ?? meta.id}` },
            ])
          ),
        }}
      />

      <Link
        href={catSlug ? `/ranked-lists/${catSlug}` : "/ranked-lists"}
        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
      >
        <ArrowLeft size={14} /> കട്ട്-ഓഫ് ചരിത്രം
      </Link>

      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-indigo-600">
        റാങ്ക് ലിസ്റ്റ് • കാറ്റഗറി {meta.category ?? "—"}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        കാറ്റഗറി {meta.category ?? "—"} — റാങ്ക് ലിസ്റ്റ്
      </h1>
      <p className="mt-2 text-lg font-semibold text-slate-700">
        {meta.post ?? "Kerala PSC Ranked List"}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        ലിസ്റ്റ് നമ്പർ {meta.list_no ?? "—"} • പ്രസിദ്ധീകരിച്ച തീയതി{" "}
        {fmtDate(meta.published_on)}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-indigo-50 p-4 text-center">
          <p className="text-2xl font-extrabold text-indigo-700">{meta.entries}</p>
          <p className="text-xs text-indigo-600">ഉദ്യോഗാർത്ഥികൾ</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-4 text-center">
          <p className="text-2xl font-extrabold text-slate-700">{meta.main_count}</p>
          <p className="text-xs text-slate-500">മെയിൻ ലിസ്റ്റ്</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-4 text-center">
          <p className="text-2xl font-extrabold text-slate-700">
            {meta.footer_total ?? "—"}
          </p>
          <p className="text-xs text-slate-500">ആകെ (PDF പ്രകാരം)</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-4 text-center">
          <p className="text-2xl font-extrabold text-slate-700">
            {meta.has_marks ? "Yes" : "No"}
          </p>
          <p className="text-xs text-slate-500">മാർക്ക് പ്രസിദ്ധീകരിച്ചു</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={meta.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500"
        >
          <FileText size={16} /> ഔദ്യോഗിക PDF (keralapsc.gov.in)
        </a>
        <Link
          href="/ranked-lists"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <Search size={16} /> ഈ ലിസ്റ്റിൽ പേര് തിരയൂ
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-slate-900">
          കട്ട്-ഓഫ് മാർക്ക്
        </h2>
        {cutoffs.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            ഈ ലിസ്റ്റിന്റെ കട്ട്-ഓഫ് മാർക്ക് ഔദ്യോഗികമായി പ്രസിദ്ധീകരിച്ചിട്ടില്ല.
            കട്ട്-ഓഫ് വരുമ്പോൾ ഇവിടെ ചേർക്കുന്നതാണ്.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">വിഭാഗം</th>
                  <th className="px-4 py-3">കട്ട്-ഓഫ് റാങ്ക്</th>
                  <th className="px-4 py-3">കട്ട്-ഓഫ് മാർക്ക്</th>
                </tr>
              </thead>
              <tbody>
                {cutoffs.map((c) => (
                  <tr key={c.community} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 font-medium text-slate-800">
                      {communityLabel(c.community)} ({c.community})
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{c.cutoff_rank}</td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {c.cutoff_marks != null
                        ? c.cutoff_marks
                        : "മാർക്ക് പ്രസിദ്ധീകരിച്ചിട്ടില്ല"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {catSlug && (
          <p className="mt-3 text-sm">
            <Link
              href={`/ranked-lists/${catSlug}`}
              className="font-semibold text-indigo-600 hover:text-indigo-800"
            >
              കാറ്റഗറി {meta.category} — മുൻ ലിസ്റ്റുകളിലെ കട്ട്-ഓഫ് ചരിത്രം കാണൂ →
            </Link>
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <Trophy size={18} className="text-amber-500" /> മുൻനിര ഉദ്യോഗാർത്ഥികൾ
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          ആദ്യ {top.length} പേർ — ആകെ {entries.length} പേരിൽ. നിങ്ങളുടെ പേര്
          കണ്ടെത്താൻ മുകളിലെ തിരയൽ ഉപയോഗിക്കൂ.
        </p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">റാങ്ക്</th>
                <th className="px-4 py-3">രജിസ്റ്റർ നമ്പർ</th>
                <th className="px-4 py-3">പേര്</th>
                {meta.has_marks && <th className="px-4 py-3">മാർക്ക്</th>}
                <th className="px-4 py-3">വിഭാഗം</th>
              </tr>
            </thead>
            <tbody>
              {top.map((e) => (
                <tr key={e.regno} className="border-t border-slate-100">
                  <td className="px-4 py-2.5 font-bold text-slate-800">{e.rank}</td>
                  <td className="px-4 py-2.5 text-slate-600">{e.regno}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{e.name}</td>
                  {meta.has_marks && (
                    <td className="px-4 py-2.5 text-slate-600">{e.total ?? "—"}</td>
                  )}
                  <td className="px-4 py-2.5 text-slate-600">
                    {e.community ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-slate-400">
        വിവരങ്ങൾ കേരള പി.എസ്.സിയുടെ ഔദ്യോഗിക റാങ്ക് ലിസ്റ്റ് PDF-ൽ നിന്ന്.
        ഔദ്യോഗിക സ്ഥിരീകരണത്തിന് എപ്പോഴും keralapsc.gov.in പരിശോധിക്കുക.
      </p>
    </div>
  );
}
