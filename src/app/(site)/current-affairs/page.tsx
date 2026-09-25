import { Suspense } from "react";
import { getPublishedPosts } from "@/lib/posts";
import CurrentAffairsList from "@/components/site/CurrentAffairsList";

export const metadata = {
  title: "Daily Kerala PSC Current Affairs",
  description:
    "Day-wise Kerala PSC current affairs in English and Malayalam — daily updates, exam-oriented facts and free quizzes.",
};

// Cache the listing shell for 5 minutes. Pagination (`?page=N`) lives in
// the Suspense island below, so flipping pages stays dynamic without
// forcing the whole page to re-query Supabase on every visit.
export const revalidate = 300;

function ListSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}

export default async function CurrentAffairsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // NOTE: searchParams is intentionally NOT awaited here — it's passed
  // straight through to the Suspense island so this shell stays static.
  // The article count doesn't depend on the page param, so it's safe to
  // fetch (and cache) here.
  const { count } = await getPublishedPosts({ page: 1, perPage: 1 });

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Current Affairs</h1>
      <p className="mt-2 text-slate-500">{count} articles published</p>

      <Suspense fallback={<ListSkeleton />}>
        <CurrentAffairsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
