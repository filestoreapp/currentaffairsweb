"use client";

import { useMemo, useState } from "react";
import { Search, Download, ExternalLink } from "lucide-react";

export interface PyqDirectoryPaper {
  post: string;
  category_no: string | null;
  paper_code: string | null;
  exam_date: string;
  year: number;
  official_pdf_url: string | null;
}

const PSC_ARCHIVE_URL = "https://www.keralapsc.gov.in";

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function matches(p: PyqDirectoryPaper, q: string) {
  const hay = [p.post, p.paper_code ?? "", p.category_no ?? ""]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function PaperTable({ papers }: { papers: PyqDirectoryPaper[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left">
            <th className="px-4 py-3 font-bold text-slate-700">തസ്തിക</th>
            <th className="w-28 px-4 py-3 font-bold text-slate-700">
              കാറ്റഗറി നം.
            </th>
            <th className="w-28 px-4 py-3 font-bold text-slate-700">
              പേപ്പർ കോഡ്
            </th>
            <th className="w-32 px-4 py-3 font-bold text-slate-700">
              പരീക്ഷാ തീയതി
            </th>
            <th className="w-36 px-4 py-3 font-bold text-slate-700">PDF</th>
          </tr>
        </thead>
        <tbody>
          {papers.map((p, i) => (
            <tr
              key={`${p.paper_code ?? p.post}-${p.exam_date}-${i}`}
              className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40"
            >
              <td className="px-4 py-3 font-medium text-slate-800">{p.post}</td>
              <td className="px-4 py-3 text-slate-600">
                {p.category_no ?? <span className="text-slate-300">—</span>}
              </td>
              <td className="px-4 py-3 font-medium text-slate-600">
                {p.paper_code ?? <span className="text-slate-300">—</span>}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                {fmtDate(p.exam_date)}
              </td>
              <td className="px-4 py-3">
                {p.official_pdf_url ? (
                  <a
                    href={p.official_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                  >
                    <Download size={13} /> PDF
                  </a>
                ) : (
                  <a
                    href={PSC_ARCHIVE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                  >
                    PSC സൈറ്റ് <ExternalLink size={12} />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PyqDirectory({
  papers,
}: {
  papers: PyqDirectoryPaper[];
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const years = useMemo(() => {
    const byYear = new Map<number, PyqDirectoryPaper[]>();
    for (const p of papers) {
      if (q && !matches(p, q)) continue;
      const arr = byYear.get(p.year) ?? [];
      arr.push(p);
      byYear.set(p.year, arr);
    }
    return [...byYear.entries()].sort((a, b) => b[0] - a[0]);
  }, [papers, q]);

  const totalShown = years.reduce((s, [, arr]) => s + arr.length, 0);

  return (
    <div>
      <div className="relative">
        <Search
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="തസ്തിക, പേപ്പർ കോഡ് അല്ലെങ്കിൽ കാറ്റഗറി നമ്പർ ഉപയോഗിച്ച് തിരയാം…"
          aria-label="Search previous year papers"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {q ? (
          <>
            <span className="font-bold text-slate-800">{totalShown}</span>{" "}
            പേപ്പറുകൾ കണ്ടെത്തി
            {totalShown === 0 &&
              " — മറ്റൊരു പേര്, കോഡ് അല്ലെങ്കിൽ നമ്പർ പരീക്ഷിക്കൂ."}
          </>
        ) : (
          <>
            <span className="font-bold text-slate-800">{papers.length}</span>{" "}
            ചോദ്യപേപ്പറുകൾ — 2026-ലെ {papers.filter((p) => p.year === 2026).length} എണ്ണവും
            2025-ലെ {papers.filter((p) => p.year === 2025).length} എണ്ണവും
          </>
        )}
      </p>

      {years.length === 0 && q && (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          ഈ തിരച്ചിലിന് പേപ്പറുകളൊന്നും കിട്ടിയില്ല. തസ്തികയുടെ പേര്, പേപ്പർ
          കോഡ് (ഉദാ: 94/26) അല്ലെങ്കിൽ കാറ്റഗറി നമ്പർ ഉപയോഗിച്ച് തിരയാം.
        </p>
      )}

      {years.map(([year, list]) => (
        <section key={year} className="mt-8">
          <h2 className="text-xl font-extrabold tracking-tight">
            {year} — {list.length} പേപ്പറുകൾ
          </h2>
          <div className="mt-3">
            <PaperTable papers={list} />
          </div>
        </section>
      ))}

      <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        PDF ലിങ്ക് കാണുന്ന പേപ്പറുകൾ ഔദ്യോഗിക PSC സൈറ്റിൽ നിന്ന് നേരിട്ട്
        ഡൗൺലോഡ് ചെയ്യാം. ലിങ്കില്ലാത്ത പേപ്പറുകൾ ഔദ്യോഗിക സൈറ്റിൽ
        (keralapsc.gov.in) പേപ്പർ കോഡ് ഉപയോഗിച്ച് തിരയാം. ഈ പട്ടികയിൽ
        ഉൾപ്പെടാത്ത പേപ്പറുകൾ ഉണ്ടാകാം — പൂർണമായ പട്ടികയ്ക്ക് ഔദ്യോഗിക സൈറ്റ്
        നോക്കുക.
      </p>
    </div>
  );
}
