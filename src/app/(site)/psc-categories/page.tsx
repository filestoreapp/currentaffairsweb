import Link from "next/link";
import {
  getPublishedPscCategories,
  type PscCategory,
} from "@/lib/psc-categories";
import { Hash, ChevronRight, CalendarDays, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerala PSC Categories",
  description:
    "Kerala PSC category-wise pages: announcements, exam countdowns, question papers and answer keys by category number.",
};

export const revalidate = 300;

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff =
    new Date(dateStr + "T00:00:00").getTime() -
    new Date(new Date().toDateString()).getTime();
  return Math.floor(diff / 86400000);
}

function CategoryCard({ cat }: { cat: PscCategory }) {
  const d = daysUntil(cat.exam_date);
  const hasPapers = cat.paper_sections.some((s) => s.question_key || s.answer_key);
  return (
    <Link
      href={`/psc-categories/${cat.slug}`}
      className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
        <Hash size={20} />
      </span>
      <span className="flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="block font-bold text-slate-900">
            Category {cat.cat_no}
          </span>
          {cat.announcement_type && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {cat.announcement_type}
            </span>
          )}
        </span>
        <span className="mt-1 block text-sm font-medium text-slate-700">
          {cat.post_name}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400">
          {d !== null && d >= 0 && (
            <span className="flex items-center gap-1 text-indigo-600">
              <CalendarDays size={13} />
              Exam in {d} {d === 1 ? "day" : "days"}
            </span>
          )}
          {d !== null && d < 0 && (
            <span className="flex items-center gap-1">
              <CalendarDays size={13} />
              Exam held
            </span>
          )}
          {hasPapers && (
            <span className="flex items-center gap-1 text-emerald-600">
              <FileText size={13} />
              Papers available
            </span>
          )}
        </span>
      </span>
      <ChevronRight size={18} className="mt-1 shrink-0 text-slate-300" />
    </Link>
  );
}

export default async function PscCategoriesPage() {
  const cats = await getPublishedPscCategories();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          PSC Categories
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Every Kerala PSC category number on its own page — announcements,
          exam countdowns, and question papers with answer keys.
        </p>
      </div>

      {cats.length === 0 ? (
        <p className="mt-12 text-center text-slate-500">
          No categories yet — check back soon.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {cats.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </div>
      )}
    </div>
  );
}
