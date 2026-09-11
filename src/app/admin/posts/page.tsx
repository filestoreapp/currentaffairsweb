import Link from "next/link";
import { getAllPostsForAdmin } from "@/lib/posts";
import { format } from "date-fns";
import { PlusCircle, Pencil } from "lucide-react";
import DeletePostButton from "@/components/admin/DeletePostButton";

export default async function AdminPostsPage() {
  const posts = await getAllPostsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <PlusCircle size={16} /> New Post
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
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
