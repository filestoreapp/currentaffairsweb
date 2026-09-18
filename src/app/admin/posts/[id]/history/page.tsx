import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getPostByIdForAdmin } from "@/lib/posts";
import { getPostRevisions } from "@/lib/actions/posts";
import RestoreRevisionButton from "@/components/admin/RestoreRevisionButton";

export default async function PostHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostByIdForAdmin(id);
  if (!post) notFound();

  const revisions = await getPostRevisions(id);

  return (
    <div>
      <Link
        href={`/admin/posts/${id}/edit`}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft size={16} /> Back to editor
      </Link>

      <h1 className="mt-3 text-2xl font-extrabold">Version history</h1>
      <p className="mt-1 text-sm text-slate-500">{post.title}</p>

      <div className="mt-6 space-y-3">
        {revisions.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-400">
            No earlier versions yet — a snapshot is saved automatically each
            time you update this post.
          </p>
        )}

        {revisions.map((rev, i) => (
          <div
            key={rev.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-semibold text-slate-800">{rev.title}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {format(new Date(rev.created_at), "dd MMM yyyy, hh:mm a")}
                {i === 0 ? " · most recent snapshot" : ""}
              </p>
            </div>
            <RestoreRevisionButton revisionId={rev.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
