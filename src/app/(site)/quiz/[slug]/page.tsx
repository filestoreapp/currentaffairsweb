import { getQuizBySlug, getLeaderboard } from "@/lib/quizzes";
import { notFound, redirect } from "next/navigation";
import QuizPlayer from "@/components/site/QuizPlayer";
import { breadcrumbJsonLd, fitTitle, istDateParts, quizJsonLd, quizPageMetadata, siteUrl } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 300; // 5 min — leaderboard shown is the starting snapshot; client updates it live after each attempt

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getQuizBySlug(slug);
  if (!quiz) return { title: "Quiz" };
  const count = quiz.questions?.length ?? 0;
  const description =
    quiz.description ||
    `Practice "${quiz.title}" — ${count} free Kerala PSC quiz questions with answers and explanations.`;
  // Search title in English — the visible player heading stays Malayalam.
  // Daily quizzes get the digest-style dated title.
  const dailyMatch = slug.match(/^daily-current-affairs-quiz-(\d{4}-\d{2}-\d{2})$/);
  const parts = dailyMatch ? istDateParts(`${dailyMatch[1]}T00:00:00+05:30`) : null;
  const title =
    parts != null
      ? `Kerala PSC Daily Quiz ${parts.day} ${parts.monthLong} ${parts.year} (Malayalam)`
      : fitTitle(`${quiz.title} — Kerala PSC Quiz`);
  return quizPageMetadata({
    title: { absolute: title },
    description,
    url: `${siteUrl()}/quiz/${quiz.slug}`,
  });
}

export default async function QuizTakePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quiz = await getQuizBySlug(slug);

  if (!quiz) notFound();

  // Mock tests and PYQ papers have their own exam-style runner.
  if (quiz.is_mock) redirect(`/mock-tests/${slug}`);
  if (quiz.is_pyq) redirect(`/pyqs/${slug}`);

  const leaderboard = await getLeaderboard(quiz.id);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            quizJsonLd(quiz, `${siteUrl()}/quiz/${quiz.slug}`)
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Quizzes", path: "/quiz" },
              { name: quiz.title },
            ])
          ),
        }}
      />
      <QuizPlayer quiz={quiz} initialLeaderboard={leaderboard} />
    </>
  );
}
