import sharp from "sharp";

const REPO = "filestoreapp/images";
const BRANCH = "main";

/**
 * Compress any uploaded image: cap width at 1600px, convert to WebP.
 * Typically 5-10x smaller than a phone-camera original, which keeps the
 * free image repo tiny and pages fast.
 */
export async function compressImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate() // honor EXIF orientation
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

function cdnUrl(path: string, commitSha: string) {
  // Pin to the commit SHA (not @main): immutable, so jsDelivr caches it
  // forever and there's never a stale-cache problem after overwrites.
  return `https://cdn.jsdelivr.net/gh/${REPO}@${commitSha}/${path}`;
}

/**
 * Upload a buffer to the images GitHub repo and return a
 * jsDelivr CDN URL. Pass `upsert: true` with a stable path to overwrite
 * an existing file (used for generated thumbnails).
 */
export async function uploadToImageCdn(
  buffer: Buffer,
  path: string,
  opts: { upsert?: boolean } = {}
): Promise<string> {
  const token = process.env.GITHUB_IMAGE_TOKEN;
  if (!token) {
    throw new Error(
      "Image uploads need a GITHUB_IMAGE_TOKEN env var (a GitHub fine-grained " +
        "PAT with Contents read/write on the images repo). " +
        "Add it in Vercel → Project → Settings → Environment Variables."
    );
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
  const apiUrl = `https://api.github.com/repos/${REPO}/contents/${path}`;

  let sha: string | undefined;
  if (opts.upsert) {
    const existing = await fetch(`${apiUrl}?ref=${BRANCH}`, { headers });
    if (existing.ok) {
      sha = (await existing.json()).sha;
    }
  }

  const res = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `Upload ${path}`,
      content: buffer.toString("base64"),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Image upload failed (GitHub ${res.status}): ${body.slice(0, 200)}`);
  }
  const commitSha = (await res.json()).commit.sha as string;
  return cdnUrl(path, commitSha);
}

/** Dated path for user uploads, e.g. images/2026/09/1727…-ab12.webp */
export function datedImagePath(filename: string) {
  const now = new Date();
  const ym = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `images/${ym}/${filename}`;
}
