"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, ExternalLink, Send, Trash2 } from "lucide-react";
import {
  publishDigestPostAction,
  deleteDigestPostAction,
} from "@/lib/actions/digest";

export default function DigestRowActions({
  id,
  slug,
  status,
}: {
  id: string;
  slug: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const run = (fn: () => Promise<unknown>, label: string) => {
    setError(null);
    setDone(null);
    startTransition(async () => {
      try {
        await fn();
        setDone(label);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/posts/${id}/edit`}
        title="Edit draft"
        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
      >
        <Pencil size={15} />
      </Link>
      {status === "published" && (
        <Link
          href={`/current-affairs/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          title="View live post"
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
        >
          <ExternalLink size={15} />
        </Link>
      )}
      {status === "draft" && (
        <>
          <button
            disabled={isPending}
            onClick={() =>
              run(() => publishDigestPostAction(slug), "Published + announced on Telegram")
            }
            title="Publish now (generates thumbnail, announces on Telegram)"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <Send size={14} />
            {isPending ? "Publishing…" : "Publish"}
          </button>
          <button
            disabled={isPending}
            onClick={() => {
              if (!window.confirm("Delete this digest draft?")) return;
              run(() => deleteDigestPostAction(slug), "Draft deleted");
            }}
            title="Delete draft"
            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <Trash2 size={15} />
          </button>
        </>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
      {done && <span className="text-xs text-emerald-600">{done}</span>}
    </div>
  );
}
