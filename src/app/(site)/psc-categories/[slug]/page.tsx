import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPscCategoryBySlug,
  getPscCategorySlugs,
} from "@/lib/psc-categories";
import Countdown from "@/components/site/Countdown";
import PaperSectionsList from "@/components/site/PaperSectionsList";
import { ChevronLeft, ExternalLink, Building2, ScrollText } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getPscCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getPscCategoryBySlug(slug);
  if (!cat) return { title: "Category not found" };
  return {
    title: `Category ${cat.cat_no} — ${cat.post_name}`,
    description: `Kerala PSC category ${cat.cat_no}: ${cat.post_name}. Announcements, exam countdown, question papers and answer keys.`,
  };
}

function fmtDate(d: string | null): string | null {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function PscCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = await getPscCategoryBySlug(slug);
  if (!cat) notFound();

  const facts: [string, string | null][] = [
    ["Category number", cat.cat_no],
    ["Post", cat.post_name],
    ["Department", cat.department],
    ["Announcement", cat.announcement_type],
    ["List number", cat.list_no],
    ["List date", fmtDate(cat.list_date)],
    ["Exam date", fmtDate(cat.exam_date)],
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/psc-categories"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-indigo-600"
      >
        <ChevronLeft size={16} /> All categories
      </Link>

      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-600 px-3 py-1 text-sm font-black text-white">
            Category {cat.cat_no}
          </span>
          {cat.announcement_type && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {cat.announcement_type}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          {cat.post_name}
        </h1>
        {cat.department && (
          <p className="mt-2 flex items-center gap-1.5 text-slate-600">
            <Building2 size={16} className="text-slate-400" />
            {cat.department}
          </p>
        )}
      </div>

      {cat.exam_date && (
        <div className="mt-6">
          <Countdown targetDate={cat.exam_date} />
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
          Key facts
        </h2>
        <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {facts
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="flex gap-2 text-sm">
                <dt className="w-36 shrink-0 font-semibold text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-800">{v}</dd>
              </div>
            ))}
        </dl>
        {cat.details && (
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
            {cat.details}
          </p>
        )}
        {cat.source_url && (
          <a
            href={cat.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <ExternalLink size={15} /> Official PSC notification / PDF
          </a>
        )}
      </div>

      <div className="mt-6">
        <PaperSectionsList
          sections={cat.paper_sections}
          downloadHref={(i, kind) =>
            `/api/psc-category/download/${cat.slug}?section=${i}&kind=${kind}`
          }
        />
      </div>

      {cat.paper_sections.filter((s) => s.question_key || s.answer_key).length === 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5 text-sm text-slate-500">
          <ScrollText size={18} className="shrink-0 text-slate-400" />
          Question papers and answer keys will appear here after the exam.
        </div>
      )}
    </div>
  );
}
