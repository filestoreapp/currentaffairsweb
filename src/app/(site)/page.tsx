import Link from "next/link";
import { getLatestPosts, getAllCategories } from "@/lib/posts";
import PostCard from "@/components/site/PostCard";

export default async function HomePage() {
  const [posts, categories] = await Promise.all([
    getLatestPosts(9),
    getAllCategories(),
  ]);

  return (
    <div>
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-14 text-center text-white sm:px-12">
        <h1 className="text-3xl font-extrabold sm:text-5xl">
          Kerala PSC Current Affairs
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-indigo-100">
          Daily updates, GK notes and exam-focused current affairs to help
          you crack your dream government job.
        </p>
        <Link
          href="/current-affairs"
          className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
        >
          Browse All Updates
        </Link>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Latest Updates</h2>
        <Link
          href="/current-affairs"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          View all →
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-6 text-slate-500">
          No posts published yet. Log in to /admin to create your first
          post.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
