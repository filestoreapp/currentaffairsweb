import Link from "next/link";
import { getAllPostsForAdmin } from "@/lib/posts";
import { PlusCircle } from "lucide-react";
import BackfillThumbnailsButton from "@/components/admin/BackfillThumbnailsButton";
import CleanupThumbnailsButton from "@/components/admin/CleanupThumbnailsButton";
import PostsTable from "@/components/admin/PostsTable";

export default async function AdminPostsPage() {
  const posts = await getAllPostsForAdmin();
  const missingCount = posts.filter((p) => !p.cover_image).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Posts</h1>
        <div className="flex items-center gap-3">
          <CleanupThumbnailsButton />
          <BackfillThumbnailsButton missingCount={missingCount} />
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <PlusCircle size={16} /> New Post
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <PostsTable posts={posts} />
      </div>
    </div>
  );
}
