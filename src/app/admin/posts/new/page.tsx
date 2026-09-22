import { getAllCategories } from "@/lib/posts";
import PostForm from "@/components/admin/PostForm";

export default async function NewPostPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">New Post</h1>
      <div className="mt-6">
        <PostForm categories={categories} />
      </div>
    </div>
  );
}
