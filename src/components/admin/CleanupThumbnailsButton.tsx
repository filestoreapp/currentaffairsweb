"use client";

import { useState, useTransition } from "react";
import { cleanupOrphanedThumbnails } from "@/lib/actions/thumbnail";
import { Trash2, Loader2 } from "lucide-react";

export default function CleanupThumbnailsButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ deleted: number; kept: number } | null>(
    null
  );

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-xs font-medium text-slate-500">
          Deleted {result.deleted} unused file{result.deleted === 1 ? "" : "s"}
          {result.kept ? `, kept ${result.kept} in use` : ""}
        </span>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await cleanupOrphanedThumbnails();
            setResult(res);
          })
        }
        className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
        Clean up unused thumbnails
      </button>
    </div>
  );
}
