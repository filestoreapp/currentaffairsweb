"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ScrollText } from "lucide-react";
import type { Quiz } from "@/lib/types";

/** Expandable PYQ-paper list shown inside an exam hub card. */
export default function ExamHubPapers({ papers }: { papers: Quiz[] }) {
  const [open, setOpen] = useState(false);
  if (papers.length === 0) return null;

  return (
    <div className="border-t border-slate-100">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-amber-50/50"
      >
        <span className="flex items-center gap-2">
          <ScrollText size={15} className="text-amber-600" />
          PYQ Papers ({papers.length})
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="space-y-0.5 px-3 pb-3">
          {papers.map((p) => (
            <li key={p.id}>
              <Link
                href={`/pyqs/${p.slug}`}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-amber-50"
              >
                <span className="truncate font-medium text-slate-700">
                  {p.title}
                </span>
                {p.exam_year && (
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                    {p.exam_year}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
