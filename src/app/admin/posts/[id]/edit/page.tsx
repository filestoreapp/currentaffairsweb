import { getAllCategories, getPostByIdForAdmin } from "@/lib/posts";
import PostForm from "@/components/admin/PostForm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { History } from "lucide-react";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    getPostByIdForAdmin(id),
    getAllCategories(),
  ]);

  if (!post) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Edit Post</h1>
        <Link
          href={`/admin/posts/${id}/history`}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          <History size={16} /> Version history
        </Link>
      </div>
      <div className="mt-6">
        <PostForm post={post} categories={categories} />
      </div>
    </div>
  );
}
