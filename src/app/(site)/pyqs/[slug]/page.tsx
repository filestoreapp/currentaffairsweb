import { getPyqBySlug, getMockLeaderboard } from "@/lib/quizzes";
import { notFound } from "next/navigation";
import MockTestPlayer from "@/components/site/MockTestPlayer";
import { quizJsonLd, quizPageMetadata, siteUrl } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const paper = await getPyqBySlug(slug);
  if (!paper) return { title: "PYQ Paper" };
  const count = paper.questions?.length ?? 0;
  const examBit =
    paper.exam_name || paper.exam_year
      ? ` (${[paper.exam_name, paper.exam_year].filter(Boolean).join(" ")})`
      : "";
  const description =
    paper.description ||
    `${paper.title}${examBit} — practice ${count} real Kerala PSC previous year questions free, with answers and live leaderboard.`;
  return quizPageMetadata({
    title: `${paper.title} — PYQ Paper`,
    description,
    url: `${siteUrl()}/pyqs/${paper.slug}`,
  });
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            quizJsonLd(paper, `${siteUrl()}/pyqs/${paper.slug}`)
          ),
        }}
      />
      {paper.pdf_url && (
        <div className="mx-auto mb-6 max-w-5xl px-4 sm:px-6">
          <a
            href={paper.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Download original question paper (PDF)
          </a>
        </div>
      )}
      <MockTestPlayer quiz={paper} initialLeaderboard={leaderboard} />
    </>
  );
}
