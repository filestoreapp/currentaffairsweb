import { NextResponse } from "next/server";
import { getPscCategoryBySlug } from "@/lib/psc-categories";
import {
  createPyqDownloadUrl,
  isPdfStorageConfigured,
} from "@/lib/pdf-storage";

export const dynamic = "force-dynamic";

/**
 * Download a question paper / answer key section for a published PSC
 * category page. Mints a short-lived presigned GET URL and redirects
 * straight to B2 — bytes never pass through Vercel.
 * Usage: /api/psc-category/download/<slug>?section=<index>&kind=question|answer
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

  const cat = await getPscCategoryBySlug(slug);
  if (!cat) {
    return NextResponse.json(
      { error: "Category or PDF not found." },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(req.url);
  const sectionParam = searchParams.get("section");
  const sec = cat.paper_sections[Number(sectionParam)];
  if (!sec) {
    return NextResponse.json(
      { error: "Section not found." },
      { status: 404 }
    );
  }
  const key =
    searchParams.get("kind") === "answer" ? sec.answer_key : sec.question_key;

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
