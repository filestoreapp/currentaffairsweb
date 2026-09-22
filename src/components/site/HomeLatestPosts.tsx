import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublishedPosts } from "@/lib/posts";
import PostCard from "@/components/site/PostCard";

const PER_PAGE = 9;

/**
 * Dynamic island of the homepage: reads the `page` search param, so it
 * streams in inside a <Suspense> boundary while the rest of the page
 * serves from the ISR cache.
 */
export default async function HomeLatestPosts({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pscSource?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pscSource = params.pscSource ? `&pscSource=${params.pscSource}` : "";

  const { posts, count } = await getPublishedPosts({ page, perPage: PER_PAGE });
  const totalPages = Math.max(1, Math.ceil(count / PER_PAGE));

  return (
    <>
      {posts.length === 0 ? (
        <p className="mt-6 text-slate-500">
          No posts published yet. Log in to /admin to create your first
          post.
        </p>
      ) : (
        <>
          {posts[0] && (
            <Link
              href={`/current-affairs/${posts[0].slug}`}
              className="card-hover group mt-6 grid overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-2"
            >
              <div className="relative min-h-56 overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 sm:min-h-72">
                {posts[0].cover_image ? (
                  <img
                    src={posts[0].cover_image}
                    alt={posts[0].title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-8">
                    <span className="text-6xl font-extrabold text-white/25">
                      PSC
                    </span>
                  </div>
                )}
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700 backdrop-blur">
                  Latest
                </span>
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                {posts[0].category && (
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                    {posts[0].category.name}
                  </span>
                )}
                <h3 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 group-hover:text-indigo-700 sm:text-3xl">
                  {posts[0].title}
                </h3>
                {posts[0].excerpt && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-500">
                    {posts[0].excerpt}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600">
                  Read the full story
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(1).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/?page=${p}${pscSource}`}
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
