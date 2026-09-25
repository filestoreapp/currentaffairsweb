import { getQuizBySlug, getLeaderboard } from "@/lib/quizzes";
import { notFound, redirect } from "next/navigation";
import QuizPlayer from "@/components/site/QuizPlayer";
import { quizJsonLd, quizPageMetadata, siteUrl } from "@/lib/seo";
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
  return quizPageMetadata({
    title: quiz.title,
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
      <QuizPlayer quiz={quiz} initialLeaderboard={leaderboard} />
    </>
  );
}
