"use client";

import { useTransition } from "react";
import { restorePostRevision } from "@/lib/actions/posts";
import { RotateCcw, Loader2 } from "lucide-react";

export default function RestoreRevisionButton({ revisionId }: { revisionId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (
          confirm(
            "Restore this version? The post's current content will be snapshotted first, so you can always undo this too."
          )
        ) {
          startTransition(() => restorePostRevision(revisionId));
        }
      }}
      disabled={isPending}
      className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
      Restore
    </button>
  );
}
