import { getPscUpdateById } from "@/lib/psc-updates";
import { PSC_SOURCES } from "@/lib/psc-scraper/sources";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";
import ShareButtons from "@/components/site/ShareButtons";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const update = await getPscUpdateById(id);
  if (!update) return {};
  const label = PSC_SOURCES.find((s) => s.key === update.source)?.label ?? update.source;
  return {
    title: `${update.title} | ${label}`,
    description: update.category_number || update.title,
  };
}

export default async function PscUpdateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const update = await getPscUpdateById(id);
  if (!update) notFound();

  const label = PSC_SOURCES.find((s) => s.key === update.source)?.label ?? update.source;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const pageUrl = `${siteUrl}/psc-updates/${update.id}`;
  const officialLink = update.pdf_url || update.source_url;

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        href="/psc-updates"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft size={15} /> All PSC updates
      </Link>

      <span className="mt-4 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
        {label}
      </span>

      <h1 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">
        {update.title}
      </h1>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {update.category_number ? `${update.category_number} · ` : ""}
          {update.published_on
            ? format(new Date(update.published_on), "dd MMM yyyy")
            : format(new Date(update.scraped_at), "dd MMM yyyy")}
        </p>
        <ShareButtons url={pageUrl} title={update.title} />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-600">
          This update was pulled automatically from the official Kerala PSC
          website. Use the button below to open the original notification or
          download the PDF — always verify deadlines against the official
          source before acting.
        </p>
        <a
          href={officialLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600"
        >
          {update.pdf_url ? (
            <>
              <Download size={15} /> Download PDF
            </>
          ) : (
            <>
              <ExternalLink size={15} /> Open on keralapsc.gov.in
            </>
          )}
        </a>
      </div>
    </article>
  );
}
