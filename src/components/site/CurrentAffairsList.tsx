import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";
import PostCard from "@/components/site/PostCard";

const PER_PAGE = 12;

/**
 * Dynamic island of the current-affairs listing: reads the `page` search
 * param, so it streams in inside a <Suspense> boundary while the rest of
 * the page serves from the ISR cache.
 */
export default async function CurrentAffairsList({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { posts, count } = await getPublishedPosts({ page, perPage: PER_PAGE });
  const totalPages = Math.max(1, Math.ceil(count / PER_PAGE));

  return (
    <>
      {posts.length === 0 ? (
        <p className="mt-10 text-slate-500">No posts yet. Check back soon!</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/current-affairs?page=${p}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                p === page
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
