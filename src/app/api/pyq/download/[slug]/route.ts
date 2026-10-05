import { NextResponse } from "next/server";
import { getPyqBySlug } from "@/lib/quizzes";
import {
  createPyqDownloadUrl,
  isPdfStorageConfigured,
} from "@/lib/pdf-storage";

export const dynamic = "force-dynamic";

/**
 * Download the original question paper PDF for a published PYQ paper.
 * The B2 bucket is private, so this mints a short-lived presigned GET URL
 * and redirects the visitor straight to B2 — the bytes never pass through
 * Vercel, so no serverless bandwidth is consumed.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!isPdfStorageConfigured()) {
    return NextResponse.json(
      { error: "PDF storage is not configured." },
      { status: 500 }
    );
  }

  // getPyqBySlug only returns published PYQ papers — drafts stay hidden.
  const paper = await getPyqBySlug(slug);
  if (!paper) {
    return NextResponse.json(
      { error: "Paper or PDF not found." },
      { status: 404 }
    );
  }

  // Section download: ?section=<index>&kind=question|answer
  const { searchParams } = new URL(req.url);
  const sectionParam = searchParams.get("section");
  let key: string | null = paper.pdf_key;
  if (sectionParam !== null) {
    const sections = (paper.paper_sections ?? []) as {
      label: string;
      question_key: string | null;
      answer_key: string | null;
    }[];
    const sec = sections[Number(sectionParam)];
    if (!sec) {
      return NextResponse.json(
        { error: "Section not found." },
        { status: 404 }
      );
    }
    key =
      searchParams.get("kind") === "answer" ? sec.answer_key : sec.question_key;
  }

  if (!key) {
    return NextResponse.json(
      { error: "Paper or PDF not found." },
      { status: 404 }
    );
  }

  try {
    const url = await createPyqDownloadUrl(key);
    return NextResponse.redirect(url, 307);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Download failed." },
      { status: 500 }
    );
  }
}
