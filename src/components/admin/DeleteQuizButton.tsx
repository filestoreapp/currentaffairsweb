"use client";

import { useTransition } from "react";
import { deleteQuiz } from "@/lib/actions/quizzes";
import { Trash2 } from "lucide-react";

export default function DeleteQuizButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Delete this quiz and all its attempts?")) {
          startTransition(() => deleteQuiz(id));
        }
      }}
      disabled={isPending}
      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      title="Delete quiz"
    >
      <Trash2 size={16} />
    </button>
  );
}
