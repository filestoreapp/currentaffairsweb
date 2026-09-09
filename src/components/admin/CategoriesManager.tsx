"use client";

import { useState, useTransition } from "react";
import { createCategory, deleteCategory } from "@/lib/actions/posts";
import type { Category } from "@/lib/types";
import { Trash2, Loader2 } from "lucide-react";

export default function CategoriesManager({
  categories,
}: {
  categories: Category[];
}) {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          startTransition(async () => {
            await createCategory(name.trim());
            setName("");
          });
        }}
        className="flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          Add
        </button>
      </form>

      <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between px-5 py-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">{c.name}</p>
              <p className="text-xs text-slate-400">/{c.slug}</p>
            </div>
            <button
              onClick={() => {
                if (confirm(`Delete category "${c.name}"?`)) {
                  startTransition(() => deleteCategory(c.id));
                }
              }}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="px-5 py-6 text-sm text-slate-400">
            No categories yet.
          </p>
        )}
      </div>
    </div>
  );
}
