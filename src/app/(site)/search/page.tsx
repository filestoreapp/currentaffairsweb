import Link from "next/link";
import { format } from "date-fns";
import { searchSite } from "@/lib/search";
import { FileText, ClipboardList, Bell } from "lucide-react";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q ? await searchSite(q) : { posts: [], quizzes: [], pscUpdates: [] };
  const totalCount = results.posts.length + results.quizzes.length + results.pscUpdates.length;

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Search</h1>
      <form action="/search" className="mt-4 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search posts, quizzes, notifications..."
          className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Search
        </button>
      </form>

      {!q ? (
        <p className="mt-8 text-slate-500">Type something to search the site.</p>
      ) : totalCount === 0 ? (
        <p className="mt-8 text-slate-500">
          No results for &ldquo;{q}&rdquo;. Try a different keyword.
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {results.posts.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <FileText size={18} className="text-indigo-600" /> Current Affairs
              </h2>
              <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                {results.posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/current-affairs/${post.slug}`}
                      className="block px-5 py-3 hover:bg-slate-50"
                    >
                      <p className="font-medium text-slate-800">{post.title}</p>
                      {post.excerpt && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {post.excerpt}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.quizzes.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <ClipboardList size={18} className="text-indigo-600" /> Quizzes
              </h2>
              <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                {results.quizzes.map((quiz) => (
                  <li key={quiz.id}>
                    <Link
                      href={`/quiz/${quiz.slug}`}
                      className="block px-5 py-3 hover:bg-slate-50"
                    >
                      <p className="font-medium text-slate-800">{quiz.title}</p>
                      {quiz.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {quiz.description}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.pscUpdates.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Bell size={18} className="text-indigo-600" /> PSC Notifications
              </h2>
              <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                {results.pscUpdates.map((u) => (
                  <li key={u.id}>
                    <a
                      href={u.pdf_url || u.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-800">{u.title}</span>
                      {u.published_on && (
                        <span className="shrink-0 text-xs text-slate-400">
                          {format(new Date(u.published_on), "dd MMM yyyy")}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
