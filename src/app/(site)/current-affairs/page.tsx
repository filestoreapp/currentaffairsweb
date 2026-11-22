import { Suspense } from "react";
import { getPublishedPosts } from "@/lib/posts";
import CurrentAffairsList from "@/components/site/CurrentAffairsList";
import HubFaq from "@/components/site/HubFaq";
import type { Metadata } from "next";

const LISTING_TITLE =
  "Kerala PSC Current Affairs Malayalam — Daily Current Affairs in Malayalam";
const LISTING_DESCRIPTION =
  "Kerala PSC current affairs Malayalam — daily current affairs in Malayalam with exam-oriented facts, quick-revision tables and free quizzes for LDC, LGS, University Assistant and all Kerala PSC exams. Updated every day, free.";
const PER_PAGE = 12;

// Paginated listings canonical to their own clean URL (page 1 has no
// param; page N includes ?page=N — never all to page 1). Pages past the
// last real page are noindex (thin/empty). Reading searchParams here makes
// this route dynamic; the shell is cheap (one count query) and the island
// already fetched per page.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { count } = await getPublishedPosts({ page: 1, perPage: 1 });
  const totalPages = Math.max(1, Math.ceil(count / PER_PAGE));
  const canonical =
    page > 1
      ? `https://www.psccurrentaffairs.online/current-affairs?page=${page}`
      : "https://www.psccurrentaffairs.online/current-affairs";
  return {
    // Absolute: the composed title already carries the brand; no template suffix.
    title: { absolute: LISTING_TITLE },
    description: LISTING_DESCRIPTION,
    alternates: { canonical },
    ...(page > totalPages
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

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
      <h1 className="text-3xl font-extrabold tracking-tight">Kerala PSC Current Affairs Malayalam — ദൈനംദിന കറന്റ് അഫയേഴ്‌സ്</h1>
      <p className="mt-2 text-slate-500">
        {count} articles published — daily current affairs in Malayalam for
        Kerala PSC exams, with exam-oriented facts, quick-revision tables and
        free quizzes.
      </p>
      <p className="mt-3 max-w-2xl text-slate-500">
        If you are searching for Kerala PSC current affairs in Malayalam,
        this is the page to bookmark: a fresh Malayalam current affairs
        digest is published here every morning, covering the Kerala, India
        and world news that PSC examiners actually ask about. ഓരോ ദിവസത്തെയും
        പ്രധാന വാർത്തകൾ പരീക്ഷാ കേന്ദ്രീകൃതമായി ചുരുക്കി നൽകുന്നു — കൂടെ
        സൗജന്യ ക്വിസും.
      </p>

      <Suspense fallback={<ListSkeleton />}>
        <CurrentAffairsList searchParams={searchParams} />
      </Suspense>

      <HubFaq
        faqs={[
          {
            q: "Where can I read Kerala PSC current affairs in Malayalam?",
            a: "Right here. This page carries Kerala PSC current affairs in Malayalam, written for exam aspirants — the day's important news explained with the facts, names, dates and figures that PSC questions are made from.",
          },
          {
            q: "How often is the current affairs page updated?",
            a: "Every day. A new Malayalam current affairs digest is published each morning, and topic articles on awards, appointments, sports, science and Kerala news are added through the week.",
          },
          {
            q: "Is there a quiz with the daily current affairs?",
            a: "Yes. The daily current affairs digest comes with a free quiz, so you can test the same day's news immediately and check the answers with explanations.",
          },
          {
            q: "Which exams does this current affairs coverage help with?",
            a: "The digests are useful for all Kerala PSC exams with a current affairs component — LDC, LGS, University Assistant, Secretariat Assistant, Police Constable and degree-level exams.",
          },
          {
            q: "കറന്റ് അഫയേഴ്‌സ് വായിക്കാൻ പണം നൽകേണ്ടതുണ്ടോ? (Is the current affairs content free?)",
            a: "ഇല്ല, എല്ലാം സൗജന്യമാണ്. No — every article and quiz here is free to read, with no login or subscription needed.",
          },
        ]}
      />
    </div>
  );
}
