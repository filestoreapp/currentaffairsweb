import { getAllCategories, getPostByIdForAdmin } from "@/lib/posts";
import PostForm from "@/components/admin/PostForm";
import { notFound } from "next/navigation";

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
      <h1 className="text-2xl font-extrabold">Edit Post</h1>
      <div className="mt-6">
        <PostForm post={post} categories={categories} />
      </div>
    </div>
  );
}
