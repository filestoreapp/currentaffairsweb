"use client";

import { deletePscCategory } from "@/lib/actions/psc-categories";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function DeletePscCategoryButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!confirm("Delete this category page? This cannot be undone.")) return;
    setBusy(true);
    try {
      await deletePscCategory(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      title="Delete"
    >
      <Trash2 size={16} />
    </button>
  );
}
