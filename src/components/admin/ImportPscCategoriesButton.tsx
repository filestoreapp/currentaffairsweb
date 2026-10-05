"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { importPscCategoriesFromLatest } from "@/lib/actions/psc-categories";

export default function ImportPscCategoriesButton() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function onClick() {
    setBusy(true);
    setResult(null);
    try {
      const { inserted, updated } = await importPscCategoriesFromLatest();
      setResult(`Imported — ${inserted} new, ${updated} updated.`);
    } catch (err) {
      setResult(err instanceof Error ? `Failed: ${err.message}` : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && <span className="text-xs font-medium text-slate-500">{result}</span>}
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        {busy ? "Importing…" : "Import from PSC"}
      </button>
    </div>
  );
}
