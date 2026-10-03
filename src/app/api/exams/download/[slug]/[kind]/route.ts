import { NextResponse } from "next/server";
import { getExamBySlug } from "@/lib/exams";
import {
  createPyqDownloadUrl,
  isPdfStorageConfigured,
} from "@/lib/pdf-storage";

export const dynamic = "force-dynamic";

const KIND_TO_COLUMN = {
  notification: "notification_pdf_key",
  paper: "question_paper_pdf_key",
} as const;

/**
 * Download an exam-hub document (official notification PDF or question paper).
 * The B2 bucket is private, so this mints a short-lived presigned GET URL
 * and redirects the visitor straight to B2 — the bytes never pass through
 * Vercel, so no serverless bandwidth is consumed.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; kind: string }> }
) {
  const { slug, kind } = await params;

  if (kind !== "notification" && kind !== "paper") {
    return NextResponse.json({ error: "Invalid document kind." }, { status: 400 });
  }
  if (!isPdfStorageConfigured()) {
    return NextResponse.json(
      { error: "PDF storage is not configured." },
      { status: 500 }
    );
  }

  const exam = await getExamBySlug(slug);
  const key = exam?.[KIND_TO_COLUMN[kind]] ?? null;
  if (!key) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
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
