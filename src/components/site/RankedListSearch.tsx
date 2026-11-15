"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, FileText, Loader2 } from "lucide-react";
import { categorySlug } from "@/lib/rank-cutoffs";
import { communityLabel } from "@/lib/rank-cutoffs";

interface ApiEntry {
  rank: number;
  regno: string;
  name: string;
  total: number | null;
  community: string | null;
  section: string;
  list: {
    id: string;
    category: string | null;
    post: string | null;
    list_no: string | null;
    published_on: string | null;
    pdf_url: string;
    has_marks: boolean;
  };
}

export default function RankedListSearch({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [entries, setEntries] = useState<ApiEntry[]>([]);
  const [malayalamHint, setMalayalamHint] = useState(false);
  const [totalIndexed, setTotalIndexed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const query = q.trim();
    if (query.length < 2) {
      setEntries([]);
      setSearched(false);
      setMalayalamHint(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/ranked-lists/search?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setEntries(data.entries ?? []);
        setMalayalamHint(Boolean(data.malayalamHint));
        setTotalIndexed(data.totalIndexed ?? 0);
        setSearched(true);
      } catch {
        setEntries([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  return (
    <div>
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="പേര് അല്ലെങ്കിൽ രജിസ്റ്റർ നമ്പർ — ഉദാ: Anjali, 1089261"
          aria-label="റാങ്ക് ലിസ്റ്റിൽ പേര് തിരയൂ"
          className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-11 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        {loading && (
          <Loader2
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-indigo-500"
          />
        )}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        രജിസ്റ്റർ നമ്പർ നൽകിയാൽ കൃത്യമായ ഫലം കിട്ടും. പേരുകൾ റാങ്ക്
        ലിസ്റ്റിൽ ഇംഗ്ലീഷിലാണ് പ്രസിദ്ധീകരിക്കുന്നത് — പേര് ഇംഗ്ലീഷിൽ
        ടൈപ്പ് ചെയ്യൂ.
      </p>

      {malayalamHint && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          പി.എസ്.സി റാങ്ക് ലിസ്റ്റുകളിൽ പേരുകൾ ഇംഗ്ലീഷിലാണ്
          പ്രസിദ്ധീകരിക്കുന്നത്. അതുകൊണ്ട് മലയാളത്തിൽ തിരഞ്ഞാൽ ഫലം
          കിട്ടില്ല — അതേ പേര് ഇംഗ്ലീഷിൽ ടൈപ്പ് ചെയ്ത് നോക്കൂ.
        </div>
      )}

      {searched && !malayalamHint && entries.length === 0 && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          &ldquo;{q.trim()}&rdquo; എന്ന പേര്/നമ്പർ ഇതുവരെ സൂചികയിലാക്കിയ
          റാങ്ക് ലിസ്റ്റുകളിലൊന്നും കണ്ടെത്താനായില്ല. അക്ഷരപ്പിശക്
          പരിശോധിക്കുക, അല്ലെങ്കിൽ പേരിന്റെ ഒരു ഭാഗം മാത്രം ടൈപ്പ് ചെയ്ത്
          നോക്കൂ. പുതിയ ലിസ്റ്റുകൾ ദിവസവും ചേർക്കുന്നുണ്ട്.
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-700">
            {entries.length} ഫലം{totalIndexed > 0 ? ` — ${totalIndexed} പേരിൽ നിന്ന്` : ""}
          </p>
          <ol className="mt-3 space-y-3">
            {entries.map((e, i) => (
              <li
                key={`${e.list.id}-${e.section}-${e.rank}-${i}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">{e.name}</p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      റാങ്ക് {e.rank}
                      {e.total !== null ? ` • ആകെ മാർക്ക് ${e.total}` : ""}
                      {e.community ? ` • ${communityLabel(e.community)} (${e.community})` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      രജിസ്റ്റർ/ക്രമ നമ്പർ: {e.regno}
                      {e.section !== "main" ? ` • ${e.section}` : " • മെയിൻ ലിസ്റ്റ്"}
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                    റാങ്ക് {e.rank}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-sm">
                  <span className="font-medium text-slate-700">
                    {e.list.post ?? "റാങ്ക് ലിസ്റ്റ്"}
                  </span>
                  {e.list.category && (
                    <Link
                      href={`/ranked-lists/${categorySlug(e.list.category)}`}
                      className="font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      കാറ്റഗറി {e.list.category}
                    </Link>
                  )}
                  <a
                    href={e.list.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800"
                  >
                    <FileText size={14} />
                    ഔദ്യോഗിക PDF
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
