import { NextResponse } from "next/server";
import {
  createPyqDownloadUrl,
  isPdfStorageConfigured,
  toWorkerDownloadUrl,
} from "@/lib/pdf-storage";
import pyqPapers from "@/data/pyq-directory.json";

export const dynamic = "force-dynamic";

/**
 * Download a directory paper's PDF from B2.
 * The B2 bucket is private, so this mints a short-lived presigned GET URL.
 * When the Cloudflare Worker is configured (PYQ_WORKER_ORIGIN), the visitor
 * is redirected to the Worker instead: it forwards the signature to B2 and
 * caches the file at the Cloudflare edge, so repeat downloads never touch
 * B2 — B2 -> Cloudflare egress is free, keeping downloads off B2's
 * 1 GB/day free cap. The bytes never pass through Vercel either way, so no
 * serverless bandwidth is consumed. When the Worker is not configured, the
 * visitor is redirected straight to the presigned B2 URL as before.
 *
 * Only keys that belong to directory papers may be served: the key must
 * match the directory layout (pyq/<year>/<slug>.pdf) AND be present in
 * the directory data. Any other key — including admin-uploaded quiz PDFs
 * stored under other prefixes — is rejected, so callers cannot use this
 * route to reach arbitrary objects in the bucket.
 */
const DIRECTORY_KEY_RE = /^pyq\/(?:19|20)\d\d\/[a-z0-9][a-z0-9\-]*\.pdf$/;

const DIRECTORY_KEYS = new Set(
  (pyqPapers as { b2_key?: string | null }[])
    .map((p) => p.b2_key)
    .filter((k): k is string => typeof k === "string" && k.length > 0)
);

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");

  if (!key || !DIRECTORY_KEY_RE.test(key) || !DIRECTORY_KEYS.has(key)) {
    return NextResponse.json(
      { error: "Paper or PDF not found." },
      { status: 404 }
    );
  }

  if (!isPdfStorageConfigured()) {
    return NextResponse.json(
      { error: "PDF storage is not configured." },
      { status: 500 }
    );
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
