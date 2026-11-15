import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, TrendingDown } from "lucide-react";
import RankEstimator from "@/components/site/RankEstimator";
import {
  getCategories,
  getCategoryData,
} from "@/lib/ranked-lists";
import { categorySlug, communityLabel } from "@/lib/rank-cutoffs";
import { siteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  return getCategories().map((c) => ({ category: categorySlug(c.category) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const data = getCategoryData(category);
  if (!data) return { title: "കട്ട്-ഓഫ്" };
  const url = `${siteUrl()}/ranked-lists/${category}`;
  const title = `കാറ്റഗറി ${data.category} കട്ട്-ഓഫ് മാർക്ക് — ${data.post ?? "കേരള പി.എസ്.സി"}`;
  const description =
    `കാറ്റഗറി ${data.category} (${data.post ?? ""}) — മുൻ റാങ്ക് ലിസ്റ്റുകളിലെ ` +
    `കട്ട്-ഓഫ് മാർക്കും റാങ്കും, നിങ്ങളുടെ റാങ്ക് താരതമ്യം ചെയ്യാം.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function RankedListCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const data = getCategoryData(category);
  if (!data) notFound();

  // Cut-off history: newest first, ALL row first within each list.
  const cutoffs = [...data.cutoffs].sort(
    (a, b) =>
      (b.year ?? 0) - (a.year ?? 0) ||
      (a.community === "ALL" ? -1 : b.community === "ALL" ? 1 : 0) ||
      a.community.localeCompare(b.community)
  );

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
        കട്ട്-ഓഫ് • കാറ്റഗറി {data.category}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        കാറ്റഗറി {data.category} — കട്ട്-ഓഫ് മാർക്ക്
      </h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        {data.post ?? ""} — ഈ കാറ്റഗറിയുടെ മുൻ റാങ്ക് ലിസ്റ്റുകളിലെ
        കട്ട്-ഓഫ് മാർക്കും അവസാന റാങ്കും. കട്ട്-ഓഫ് എന്നത് ഓരോ
        വിഭാഗത്തിലെയും മെയിൻ ലിസ്റ്റിലെ അവസാന സ്ഥാനക്കാരന്റെ മാർക്കാണ്.
      </p>

      <div className="mt-8">
        <RankEstimator cutoffs={data.cutoffs} category={data.category} />
      </div>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <TrendingDown size={20} className="text-indigo-600" />
          കട്ട്-ഓഫ് ചരിത്രം
        </h2>
        {cutoffs.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            ഈ കാറ്റഗറിയുടെ ലിസ്റ്റുകളിൽ മാർക്ക് പ്രസിദ്ധീകരിച്ചിട്ടില്ല —
            റാങ്ക് മാത്രമേ ലഭ്യമായിട്ടുള്ളൂ.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">ലിസ്റ്റ്</th>
                  <th className="px-4 py-3">വിഭാഗം</th>
                  <th className="px-4 py-3">കട്ട്-ഓഫ് മാർക്ക്</th>
                  <th className="px-4 py-3">അവസാന റാങ്ക്</th>
                  <th className="px-4 py-3">മെയിൻ ലിസ്റ്റ്</th>
                </tr>
              </thead>
              <tbody>
                {cutoffs.map((c, i) => (
                  <tr
                    key={`${c.list_no}-${c.community}-${i}`}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {c.list_no ?? "—"}
                      <span className="block text-xs text-slate-400">
                        {c.year ?? ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {communityLabel(c.community)}
                      <span className="block text-xs text-slate-400">
                        {c.community}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-indigo-600">
                      {c.cutoff_marks !== null ? c.cutoff_marks : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {c.cutoff_rank}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {c.main_count} പേർ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-slate-400">
          കട്ട്-ഓഫ് മാർക്ക് ഇല്ലാത്ത വരികൾ OMR പരീക്ഷയുടെ മാർക്ക് ഇതുവരെ
          പ്രസിദ്ധീകരിക്കാത്ത ലിസ്റ്റുകളാണ് — അവയിൽ റാങ്ക് മാത്രമേ
          കാണിക്കാനാകൂ.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-slate-900">
          ഈ കാറ്റഗറിയുടെ റാങ്ക് ലിസ്റ്റുകൾ
        </h2>
        <ol className="mt-4 space-y-3">
          {data.lists.map((l) => (
            <li
              key={l.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">{l.post ?? "റാങ്ക് ലിസ്റ്റ്"}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  ലിസ്റ്റ് നമ്പർ {l.list_no ?? "—"} • {l.entries} പേർ
                  (മെയിൻ {l.main_count})
                  {l.published_on ? ` • ${l.published_on}` : ""}
                </p>
              </div>
              <a
                href={l.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                <FileText size={13} />
                ഔദ്യോഗിക PDF
              </a>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-10 text-center text-sm">
        <Link
          href="/ranked-lists"
          className="font-semibold text-indigo-600 hover:text-indigo-800"
        >
          ← എല്ലാ റാങ്ക് ലിസ്റ്റുകളും കാണൂ
        </Link>
      </p>
    </div>
  );
}
