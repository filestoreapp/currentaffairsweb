import { NextResponse } from "next/server";
import { getExamBySlug } from "@/lib/exams";
import {
  createPyqDownloadUrl,
  isPdfStorageConfigured,
  toWorkerDownloadUrl,
} from "@/lib/pdf-storage";

export const dynamic = "force-dynamic";

const KIND_TO_COLUMN = {
  notification: "notification_pdf_key",
  paper: "question_paper_pdf_key",
} as const;

/**
 * Download an exam-hub document (official notification PDF or question paper).
 * The B2 bucket is private, so this mints a short-lived presigned GET URL.
 * When the Cloudflare Worker is configured (PYQ_WORKER_ORIGIN), the visitor
 * is redirected to the Worker instead: it forwards the signature to B2 and
 * caches the file at the Cloudflare edge, keeping downloads off B2's
 * 1 GB/day free cap. The bytes never pass through Vercel either way.
 * When the Worker is not configured, the visitor is redirected straight to
 * the presigned B2 URL as before.
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
    // Through the Cloudflare Worker cache when configured, else straight
    // to the presigned B2 URL (fallback while the Worker is not deployed).
    return NextResponse.redirect(toWorkerDownloadUrl(url) ?? url, 307);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Download failed." },
      { status: 500 }
    );
  }
}
