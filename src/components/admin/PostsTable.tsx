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
                  className="h-4 w-4 rounded accent-indigo-600"
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
                <tr
                  key={post.id}
                  className={`transition hover:bg-slate-50 ${
                    selected.has(post.id) ? "bg-indigo-50/50" : ""
                  }`}
                >
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(post.id)}
                      onChange={() => toggleOne(post.id)}
                      aria-label={`Select ${post.title}`}
                      className="h-4 w-4 rounded accent-indigo-600"
                    />
                  </td>
                  <td className="max-w-xs px-5 py-3">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="group flex items-center gap-3"
                    >
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt=""
                          className="h-10 w-14 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-extrabold text-slate-400">
                          PC
                        </span>
                      )}
                      <span className="truncate font-medium text-slate-800 group-hover:text-indigo-600">
                        {post.title}
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    {post.category?.name ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {post.category.name}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                        displayStatus === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : displayStatus === "scheduled"
                          ? "bg-sky-100 text-sky-700"
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
                  <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                    {format(new Date(post.updated_at), "dd MMM yyyy")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
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
