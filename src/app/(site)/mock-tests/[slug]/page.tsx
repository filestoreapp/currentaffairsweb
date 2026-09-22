import { getMockBySlug, getMockLeaderboard } from "@/lib/quizzes";
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
  const mock = await getMockBySlug(slug);
  return {
    title: mock ? `${mock.title} — Free Mock Test` : "Mock Test",
    description: mock?.description ?? "Free Kerala PSC mock test with leaderboard.",
  };
}

export default async function MockTestTakePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mock = await getMockBySlug(slug);

  if (!mock) notFound();

  const leaderboard = await getMockLeaderboard(mock.id);

  return <MockTestPlayer quiz={mock} initialLeaderboard={leaderboard} />;
}
