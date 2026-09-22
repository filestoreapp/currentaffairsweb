import { getPyqBySlug, getMockLeaderboard } from "@/lib/quizzes";
import { notFound } from "next/navigation";
import MockTestPlayer from "@/components/site/MockTestPlayer";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const paper = await getPyqBySlug(slug);
  return {
    title: paper ? `${paper.title} — PYQ Paper` : "PYQ Paper",
    description:
      paper?.description ??
      "Kerala PSC previous year question paper with leaderboard.",
  };
}

export default async function PyqTakePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const paper = await getPyqBySlug(slug);

  if (!paper) notFound();

  // PYQ papers use the same exam-style runner as mock tests.
  const leaderboard = await getMockLeaderboard(paper.id);

  return <MockTestPlayer quiz={paper} initialLeaderboard={leaderboard} />;
}
