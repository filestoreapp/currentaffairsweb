import { uploadImageToWorker } from "@/lib/worker-client";

/**
 * Image uploads for the site. The heavy work — sharp WebP compression
 * and the GitHub API upload — runs on the Koyeb backend worker, so
 * Vercel never pays the CPU or the round-trip. This module is just a
 * thin client; callers keep the same API as before.
 */

/**
 * Compress + upload an image buffer to the GitHub-backed image CDN,
 * returning the jsDelivr URL (pinned to the commit SHA).
 */
export async function processAndUploadImage(
  input: Buffer,
  path: string,
  opts: { upsert?: boolean } = {}
): Promise<string> {
  return uploadImageToWorker(input, path, opts);
}

/** Dated path for user uploads, e.g. images/2026/09/1727…-ab12.webp */
export function datedImagePath(filename: string) {
  const now = new Date();
  const ym = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `images/${ym}/${filename}`;
}
