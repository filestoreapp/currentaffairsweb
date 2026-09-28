"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteExam } from "@/lib/actions/exams";

export default function DeleteExamButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  async function onDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    await deleteExam(id);
    router.refresh();
  }

  return (
    <button
      onClick={onDelete}
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
        confirming
          ? "bg-rose-600 text-white hover:bg-rose-700"
          : "text-rose-600 hover:bg-rose-50"
      }`}
      title={`Delete ${name}`}
    >
      <Trash2 size={14} />
      {confirming ? "Confirm delete" : "Delete"}
    </button>
  );
}
