"use client";

import { useState, useTransition } from "react";
import { deleteQuiz } from "@/lib/actions/quizzes";
import { Trash2 } from "lucide-react";

export default function DeleteQuizButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <button
          onClick={() => startTransition(() => deleteQuiz(id))}
          disabled={isPending}
          className="rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? "Deleting…" : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      disabled={isPending}
      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      title="Delete quiz"
    >
      <Trash2 size={16} />
    </button>
  );
}
