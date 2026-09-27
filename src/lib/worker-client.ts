/**
 * Thin client for the Koyeb backend worker. Heavy backend work —
 * scheduled publishes, the PSC scraper, image compression/uploads —
 * runs on the worker so Vercel stays a fast frontend/API shell.
 *
 * Env (Vercel dashboard): WORKER_URL (e.g.
 * https://media-downloader-delio-84a99868.koyeb.app), WORKER_SECRET.
 */
const WORKER_URL = (process.env.WORKER_URL || "").replace(/\/+$/, "");
const WORKER_SECRET = process.env.WORKER_SECRET || "";

function workerBase(): string {
  if (!WORKER_URL || !WORKER_SECRET) {
    throw new Error(
      "Backend worker not configured (WORKER_URL / WORKER_SECRET env vars)."
    );
  }
  return WORKER_URL;
}

/** Run a worker job: "publish-due-posts" | "publish-quiz" | "psc-scrape". */
export async function callWorker<T = unknown>(
  job: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const base = workerBase();
  const res = await fetch(`${base}/api/worker`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WORKER_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ job, ...params }),
    // Never cache worker responses.
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Worker job "${job}" failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/**
 * Send an image to the worker: it compresses to WebP (max 1600px) and
 * uploads to the GitHub-backed image CDN, returning the jsDelivr URL.
 * `path` must live under images/ or auto-thumbnails/ (the worker
 * enforces this).
 */
export async function uploadImageToWorker(
  input: Buffer,
  path: string,
  opts: { upsert?: boolean } = {}
): Promise<string> {
  const base = workerBase();
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(input)], { type: "application/octet-stream" }), "upload.bin");
  form.append("path", path);
  if (opts.upsert) form.append("upsert", "1");

  const res = await fetch(`${base}/api/worker/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${WORKER_SECRET}` },
    body: form,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Worker image upload failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { url?: string };
  if (!data.url) throw new Error("Worker image upload returned no URL.");
  return data.url;
}
