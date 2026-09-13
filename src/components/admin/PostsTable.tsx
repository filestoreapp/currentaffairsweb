"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Pencil, Loader2 } from "lucide-react";
import DeletePostButton from "@/components/admin/DeletePostButton";
import { bulkUpdateStatus, bulkDeletePosts } from "@/lib/actions/posts";
import type { Post } from "@/lib/types";

export default function PostsTable({ posts }: { posts: Post[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const allSelected = posts.length > 0 && selected.size === posts.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(posts.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function runBulk(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      setSelected(new Set());
    });
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm">
          <span className="font-semibold text-indigo-800">
            {selected.size} selected
          </span>
          <button
            disabled={isPending}
            onClick={() =>
              runBulk(() => bulkUpdateStatus(Array.from(selected), "published"))
            }
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            Publish
          </button>
          <button
            disabled={isPending}
            onClick={() =>
              runBulk(() => bulkUpdateStatus(Array.from(selected), "draft"))
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            Move to draft
          </button>
          <button
            disabled={isPending}
            onClick={() => {
              if (confirm(`Delete ${selected.size} post(s) permanently?`)) {
                runBulk(() => bulkDeletePosts(Array.from(selected)));
              }
            }}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Delete
          </button>
          {isPending && <Loader2 size={16} className="animate-spin text-indigo-600" />}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-10 px-5 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all posts"
                />
              </th>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((post) => {
              const isDue =
                post.status === "scheduled" &&
                post.published_at &&
                new Date(post.published_at) <= new Date();
              const displayStatus = isDue ? "published" : post.status;
              return (
                <tr key={post.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(post.id)}
                      onChange={() => toggleOne(post.id)}
                      aria-label={`Select ${post.title}`}
                    />
                  </td>
                  <td className="max-w-xs truncate px-5 py-3 font-medium text-slate-800">
                    {post.title}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {post.category?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        displayStatus === "published"
                          ? "bg-green-100 text-green-700"
                          : displayStatus === "scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {displayStatus}
                    </span>
                    {post.status === "scheduled" && !isDue && post.published_at && (
                      <span className="ml-2 text-xs text-slate-400">
                        {format(new Date(post.published_at), "dd MMM, hh:mm a")}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {format(new Date(post.updated_at), "dd MMM yyyy")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                        title="Edit post"
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeletePostButton id={post.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {posts.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">
            No posts yet.
          </p>
        )}
      </div>
    </div>
  );
}
