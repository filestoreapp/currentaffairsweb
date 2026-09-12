import { getQuizBySlug, getLeaderboard } from "@/lib/quizzes";
import { notFound } from "next/navigation";
import QuizPlayer from "@/components/site/QuizPlayer";
import type { Metadata } from "next";

export const revalidate = 300; // 5 min — leaderboard shown is the starting snapshot; client updates it live after each attempt

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getQuizBySlug(slug);
  return { title: quiz ? quiz.title : "Quiz" };
}

export default async function QuizTakePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quiz = await getQuizBySlug(slug);

  if (!quiz) notFound();

  const leaderboard = await getLeaderboard(quiz.id);

  return <QuizPlayer quiz={quiz} initialLeaderboard={leaderboard} />;
}
