import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ListOrdered, Search, TrendingDown } from "lucide-react";
import RankedListSearch from "@/components/site/RankedListSearch";
import {
  getCategories,
  getRankedLists,
  loadSeed,
} from "@/lib/ranked-lists";
import { categorySlug } from "@/lib/rank-cutoffs";
import { siteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const url = `${siteUrl()}/ranked-lists`;
  const title = "റാങ്ക് ലിസ്റ്റിൽ പേര് തിരയൂ — കേരള പി.എസ്.സി റാങ്ക് ലിസ്റ്റ് തിരയൽ";
  const description =
    "കേരള പി.എസ്.സി റാങ്ക് ലിസ്റ്റുകളിൽ നിങ്ങളുടെ പേര് അല്ലെങ്കിൽ രജിസ്റ്റർ നമ്പർ തിരയൂ — റാങ്ക്, മാർക്ക്, കട്ട്-ഓഫ് വിവരങ്ങൾ സഹിതം. ഔദ്യോഗിക ലിസ്റ്റുകളിൽ നിന്ന്.";
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

export default function RankedListsPage() {
  const seed = loadSeed();
  const lists = getRankedLists();
  const categories = getCategories();
  const recent = lists.slice(0, 10);

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
        റാങ്ക് ലിസ്റ്റ് • കേരള പി.എസ്.സി
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        റാങ്ക് ലിസ്റ്റിൽ നിങ്ങളുടെ പേര് തിരയൂ
      </h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        കേരള പി.എസ്.സി പ്രസിദ്ധീകരിച്ച റാങ്ക് ലിസ്റ്റുകളിൽ നിങ്ങളുടെ പേര്
        അല്ലെങ്കിൽ രജിസ്റ്റർ നമ്പർ തിരയൂ — റാങ്ക്, മാർക്ക്, വിഭാഗം,
        കട്ട്-ഓഫ് വിവരങ്ങൾ ഒറ്റയടിക്ക് കാണാം. ഇതുവരെ {seed.lists.length}{" "}
        ലിസ്റ്റുകളിലായി {seed.entries.length} പേരുടെ വിവരങ്ങൾ
        സൂചികയിലാക്കിയിട്ടുണ്ട്; പുതിയ ലിസ്റ്റുകൾ ദിവസവും ചേർക്കുന്നു.
      </p>

      <div className="mt-6">
        <RankedListSearch />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <ListOrdered size={18} className="mx-auto text-indigo-600" />
          <p className="mt-2 text-xl font-extrabold text-slate-900">
            {seed.lists.length}
          </p>
          <p className="text-xs font-medium text-slate-500">
            റാങ്ക് ലിസ്റ്റുകൾ
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <Search size={18} className="mx-auto text-indigo-600" />
          <p className="mt-2 text-xl font-extrabold text-slate-900">
            {seed.entries.length}
          </p>
          <p className="text-xs font-medium text-slate-500">
            പേരുകൾ സൂചികയിൽ
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <TrendingDown size={18} className="mx-auto text-indigo-600" />
          <p className="mt-2 text-xl font-extrabold text-slate-900">
            {categories.length}
          </p>
          <p className="text-xs font-medium text-slate-500">
            കാറ്റഗറികളിൽ കട്ട്-ഓഫ്
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-slate-900">
          കട്ട്-ഓഫ് ഉള്ള കാറ്റഗറികൾ
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          ഓരോ കാറ്റഗറിയുടെയും മുൻ കട്ട്-ഓഫ് മാർക്കും റാങ്കും കാണാനും
          നിങ്ങളുടെ റാങ്ക് താരതമ്യം ചെയ്യാനും ക്ലിക്ക് ചെയ്യൂ.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {categories.map((c) => (
            <Link
              key={c.category}
              href={`/ranked-lists/${categorySlug(c.category)}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow"
            >
              <span className="block font-bold text-slate-900">
                കാറ്റഗറി {c.category}
              </span>
              <span className="mt-0.5 block text-sm text-slate-500">
                {c.post ?? ""}
              </span>
              <span className="mt-1 block text-xs font-medium text-slate-400">
                {c.lists} ലിസ്റ്റ് • {c.entries} പേർ
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-slate-900">
          അടുത്തിടെ സൂചികയിലാക്കിയ ലിസ്റ്റുകൾ
        </h2>
        <ol className="mt-4 space-y-3">
          {recent.map((l) => (
            <li
              key={l.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">{l.post ?? "റാങ്ക് ലിസ്റ്റ്"}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  കാറ്റഗറി {l.category ?? "—"} • ലിസ്റ്റ് നമ്പർ{" "}
                  {l.list_no ?? "—"} • {l.entries} പേർ
                  {l.published_on ? ` • ${l.published_on}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {l.category && (
                  <Link
                    href={`/ranked-lists/${categorySlug(l.category)}`}
                    className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    കട്ട്-ഓഫ് കാണൂ
                  </Link>
                )}
                <a
                  href={l.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  <FileText size={13} />
                  PDF
                </a>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-extrabold text-slate-900">
          ഈ വിവരങ്ങൾ എവിടെ നിന്ന്?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          എല്ലാ വിവരങ്ങളും കേരള പബ്ലിക് സർവീസ് കമ്മീഷന്റെ ഔദ്യോഗിക
          വെബ്സൈറ്റിൽ (keralapsc.gov.in) പ്രസിദ്ധീകരിച്ച റാങ്ക് ലിസ്റ്റ്
          PDF-കളിൽ നിന്ന് നേരിട്ട് എടുത്തതാണ്. പേരുകളും റാങ്കുകളും
          മാർക്കുകളും PDF-ൽ ഉള്ളതുപോലെ തന്നെ കാണിക്കുന്നു. കട്ട്-ഓഫ്
          മാർക്ക് എന്നത് ഓരോ വിഭാഗത്തിലെയും മെയിൻ ലിസ്റ്റിലെ അവസാന
          സ്ഥാനക്കാരന്റെ മാർക്കാണ് — ഔദ്യോഗിക ലിസ്റ്റിൽ നിന്ന്
          കണക്കാക്കിയത്.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          പുതിയ റാങ്ക് ലിസ്റ്റുകൾ വരുമ്പോൾ ഈ സൂചിക ദിവസവും പുതുക്കും.
          നിങ്ങളുടെ പേര് ഇപ്പോൾ കണ്ടെത്താനായില്ലെങ്കിൽ പിന്നീട് വീണ്ടും
          തിരഞ്ഞ് നോക്കൂ.
        </p>
      </section>
    </div>
  );
}
