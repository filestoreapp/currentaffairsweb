import { Suspense } from "react";
import Link from "next/link";
import { getAllCategories } from "@/lib/posts";
import QuizList from "@/components/site/QuizList";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Free Kerala PSC Quizzes",
  description:
    "Free Kerala PSC practice quizzes with answers, explanations and leaderboards — lock in every topic.",
};

// Cache the quiz listing shell for 5 minutes. The category filter
// (`?category=...`) lives in the Suspense island below, so filtering stays
// dynamic without forcing the whole page to re-query Supabase on every
// visit.
export const revalidate = 300;

function QuizListSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}

export default async function QuizListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  // NOTE: searchParams is intentionally NOT awaited here — it's passed
  // straight through to the Suspense island so this shell stays static.
  const categories = await getAllCategories();

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Practice Quizzes</h1>
      <p className="mt-2 text-slate-500">
        Test your knowledge of Kerala PSC current affairs. Enter your name,
        answer the questions, and see how you rank!
      </p>

      <Link
        href="/mock-tests"
        className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white transition hover:shadow-lg"
      >
        <span>
          <span className="block font-extrabold">
            Want the full exam experience?
          </span>
          <span className="mt-0.5 block text-sm text-indigo-100">
            Try our free full-length mock tests — timer, negative marking and
            live leaderboards.
          </span>
        </span>
        <ArrowRight size={24} className="shrink-0" />
      </Link>

      <Suspense fallback={<QuizListSkeleton />}>
        <QuizList searchParams={searchParams} categories={categories} />
      </Suspense>
    </div>
  );
}
