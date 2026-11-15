"use client";

import { useMemo, useState } from "react";
import {
  communityLabel,
  estimateRank,
  type CutoffRow,
} from "@/lib/rank-cutoffs";
import { Calculator, AlertTriangle, CheckCircle2, MinusCircle } from "lucide-react";

/** "My rank vs past cut-offs" — honest estimate, never a guarantee. */
export default function RankEstimator({
  cutoffs,
  category,
}: {
  cutoffs: CutoffRow[];
  category: string;
}) {
  const [rank, setRank] = useState("");
  const [marks, setMarks] = useState("");
  const [community, setCommunity] = useState("ALL");

  const communities = useMemo(() => {
    const set = new Set<string>(["ALL"]);
    for (const c of cutoffs) set.add(c.community);
    return [...set];
  }, [cutoffs]);

  const hasMarks = cutoffs.some((c) => c.cutoff_marks !== null);

  const result = useMemo(() => {
    const r = rank.trim() === "" ? null : Number(rank);
    const m = marks.trim() === "" ? null : Number(marks);
    if ((r === null || isNaN(r) || r <= 0) && (m === null || isNaN(m))) {
      return null;
    }
    return estimateRank({
      cutoffs,
      rank: r,
      marks: m,
      community: community === "ALL" ? null : community,
    });
  }, [cutoffs, rank, marks, community]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
        <Calculator size={20} className="text-indigo-600" />
        എന്റെ റാങ്ക് കട്ട്-ഓഫിനോട് താരതമ്യം ചെയ്യൂ
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        കാറ്റഗറി {category} — മുൻ റാങ്ക് ലിസ്റ്റുകളിലെ കട്ട്-ഓഫുമായി
        താരതമ്യം ചെയ്യാം. ഇത് ഒരു കണക്കുകൂട്ടൽ മാത്രമാണ്.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            നിങ്ങളുടെ റാങ്ക്
          </span>
          <input
            type="number"
            min={1}
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            placeholder="ഉദാ: 42"
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            നിങ്ങളുടെ മാർക്ക് {hasMarks ? "" : "(ഈ ലിസ്റ്റുകളിൽ മാർക്ക് പ്രസിദ്ധീകരിച്ചിട്ടില്ല)"}
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            placeholder="ഉദാ: 78.5"
            disabled={!hasMarks}
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:text-slate-400"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">വിഭാഗം</span>
          <select
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {communities.map((c) => (
              <option key={c} value={c}>
                {communityLabel(c)} ({c})
              </option>
            ))}
          </select>
        </label>
      </div>

      {result && (
        <div
          className={`mt-5 rounded-xl border px-4 py-4 ${
            result.verdict === "above"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : result.verdict === "near"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          <p className="flex items-center gap-2 font-extrabold">
            {result.verdict === "above" ? (
              <CheckCircle2 size={18} className="text-emerald-600" />
            ) : result.verdict === "near" ? (
              <AlertTriangle size={18} className="text-amber-600" />
            ) : (
              <MinusCircle size={18} className="text-rose-600" />
            )}
            {result.headline}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{result.detail}</p>
          <p className="mt-2 text-xs opacity-80">അടിസ്ഥാനം: {result.basis}</p>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed opacity-80">
            {result.caveats.map((c) => (
              <li key={c}>• {c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
