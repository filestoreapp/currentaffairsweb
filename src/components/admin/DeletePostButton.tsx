"use client";

import { useTransition } from "react";
import { deletePost } from "@/lib/actions/posts";
import { Trash2 } from "lucide-react";

export default function DeletePostButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Delete this post permanently?")) {
          startTransition(() => deletePost(id));
        }
      }}
      disabled={isPending}
      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      title="Delete post"
    >
      <Trash2 size={16} />
    </button>
  );
}
