import Link from "next/link";
import { breadcrumbJsonLd, fitTitle } from "@/lib/seo";
import { format } from "date-fns";
import { ArrowLeft, Download, ExternalLink, ListChecks, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLatestPscUpdates, getShortlistById } from "@/lib/psc-updates";

export const revalidate = 900;

export async function generateStaticParams() {
  try {
    const updates = await getLatestPscUpdates({
      source: "shortlists",
      limit: 50,
    });
    return updates.map((u) => ({ id: String(u.id) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const update = await getShortlistById(id).catch(() => null);
  if (!update) return { title: "Short List — Kerala PSC" };
  return {
    title: {
      absolute: fitTitle(`${update.title} | Kerala PSC Short List`),
    },
    description: `Kerala PSC short list — ${update.title}. Check the official PSC PDF.`,
    alternates: {
      canonical: `https://www.psccurrentaffairs.online/shortlists/${update.id}`,
    },
  };
}

export default async function ShortlistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const update = await getShortlistById(id).catch(() => null);
  if (!update) notFound();

  const pdfHref = update.pdf_url || update.source_url;

  return (
    <div className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Short Lists", path: "/shortlists" },
              { name: update.title },
            ])
          ),
        }}
      />
      <Link
        href="/shortlists"
        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
      >
        <ArrowLeft size={15} /> എല്ലാ ഷോർട്ട് ലിസ്റ്റുകളും
      </Link>

      <div className="mt-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-600 px-3 py-1 text-xs font-bold text-white">
          <ListChecks size={13} /> Short List
        </span>
        <h1 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-3xl">
          {update.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {update.category_number
            ? `Category ${update.category_number} • `
            : ""}
          {update.published_on
            ? format(new Date(update.published_on), "dd MMMM yyyy")
            : `Tracked on ${format(new Date(update.scraped_at), "dd MMMM yyyy")}`}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={pdfHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
        >
          <Download size={16} />
          {update.pdf_url ? "Download official PDF" : "Open on keralapsc.gov.in"}
        </a>
        {update.pdf_url && (
          <a
            href={update.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600"
          >
            <ExternalLink size={16} /> PSC source page
          </a>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-base font-extrabold text-slate-900">
          ഷോർട്ട് ലിസ്റ്റ് എന്നാൽ എന്ത്?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          പരീക്ഷ കഴിഞ്ഞ് PSC ആദ്യം പ്രസിദ്ധീകരിക്കുന്ന സാധ്യതാ പട്ടികയാണ് ഷോർട്ട്
          ലിസ്റ്റ്. ഇതിൽ ഉൾപ്പെട്ട ഉദ്യോഗാർത്ഥികളുടെ സർട്ടിഫിക്കറ്റുകളും രേഖകളും
          പരിശോധിച്ച ശേഷമാണ് അന്തിമ റാങ്ക് ലിസ്റ്റ് തയ്യാറാക്കുന്നത്. ഷോർട്ട്
          ലിസ്റ്റിൽ പേര് വന്നാൽ ജോലി ഉറപ്പായെന്ന് അർത്ഥമില്ല — രേഖാ പരിശോധനയും
          റാങ്ക് ലിസ്റ്റും കൂടി കഴിയണം. മുകളിലെ PDF ഔദ്യോഗിക PSC ഫയലാണ്;
          ഏതെങ്കിലും തീയതിയെക്കുറിച്ച് സംശയമുണ്ടെങ്കിൽ keralapsc.gov.in-ൽ
          പരിശോധിക്കുക.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/ranked-lists"
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <Trophy size={15} /> റാങ്ക് ലിസ്റ്റിൽ പേര് തിരയൂ
        </Link>
        <Link
          href="/psc-updates"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600"
        >
          എല്ലാ PSC അറിയിപ്പുകളും
        </Link>
      </div>
    </div>
  );
}
