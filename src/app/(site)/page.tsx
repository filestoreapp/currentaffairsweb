import Link from "next/link";
import { getLatestPosts, getAllCategories } from "@/lib/posts";
import { getLatestPscUpdates } from "@/lib/psc-updates";
import { PSC_SOURCES } from "@/lib/psc-scraper/sources";
import type { PscSourceKey } from "@/lib/types";
import PostCard from "@/components/site/PostCard";
import PscUpdateCard from "@/components/site/PscUpdateCard";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ pscSource?: string }>;
}) {
  const params = await searchParams;
  const activePscSource = PSC_SOURCES.find((s) => s.key === params.pscSource)?.key as
    | PscSourceKey
    | undefined;

  const [posts, categories, pscUpdates] = await Promise.all([
    getLatestPosts(9),
    getAllCategories(),
    getLatestPscUpdates({ source: activePscSource, limit: 6 }),
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

      <section id="psc-updates" className="mt-14">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">PSC Notifications &amp; Updates</h2>
          <Link
            href="/psc-updates"
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            View all →
          </Link>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Auto-pulled from the official keralapsc.gov.in — pick a category to
          see just that.
        </p>

        <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-2">
          <Link
            href="/#psc-updates"
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
              !activePscSource
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            All
          </Link>
          {PSC_SOURCES.map((s) => (
            <Link
              key={s.key}
              href={`/?pscSource=${s.key}#psc-updates`}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
                activePscSource === s.key
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        {pscUpdates.length === 0 ? (
          <p className="mt-6 text-slate-500">
            No updates yet for this category — the scraper hasn&apos;t run,
            or hasn&apos;t found anything new.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pscUpdates.map((u) => (
              <PscUpdateCard key={u.id} update={u} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
