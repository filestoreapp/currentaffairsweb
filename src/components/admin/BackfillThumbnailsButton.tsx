"use client";

import { useState, useTransition } from "react";
import { backfillMissingThumbnails } from "@/lib/actions/thumbnail";
import { Sparkles, Loader2 } from "lucide-react";

export default function BackfillThumbnailsButton({
  missingCount,
}: {
  missingCount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ updated: number; failed: number } | null>(
    null
  );

  if (missingCount === 0 && !result) return null;

  return (
    <div className="flex items-center gap-3">
      {result ? (
        <span className="text-xs font-medium text-slate-500">
          Generated {result.updated}
          {result.failed > 0 ? `, ${result.failed} failed` : ""}
        </span>
      ) : (
        <span className="text-xs font-medium text-slate-500">
          {missingCount} post{missingCount === 1 ? "" : "s"} without a thumbnail
        </span>
      )}
      <button
        type="button"
        disabled={isPending || missingCount === 0}
        onClick={() =>
          startTransition(async () => {
            const res = await backfillMissingThumbnails();
            setResult(res);
          })
        }
        className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Sparkles size={16} />
        )}
        Generate missing thumbnails
      </button>
    </div>
  );
}
