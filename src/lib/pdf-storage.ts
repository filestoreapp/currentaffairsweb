/**
 * S3-compatible object storage for PYQ question-paper PDFs.
 * Currently pointed at Backblaze B2 (10 GB free tier, no credit card required).
 *
 * Uploads go straight from the admin's browser to B2 using a presigned PUT URL
 * minted by `createPyqUploadUrl()` — the file bytes never pass through Vercel,
 * so the 4.5 MB serverless request-body limit doesn't apply. Downloads serve
 * directly from the bucket's public URL, so Vercel bandwidth isn't consumed.
 *
 * Required env vars (set in Vercel project settings):
 *   S3_ENDPOINT         e.g. https://s3.us-west-004.backblazeb2.com
 *   S3_ACCESS_KEY_ID    B2 application keyID (bucket-scoped, read+write)
 *   S3_SECRET_ACCESS_KEY B2 applicationKey (shown once at creation)
 *   S3_BUCKET_NAME      e.g. pyq-pdfs
 *   S3_PUBLIC_URL_BASE  e.g. https://f004.backblazeb2.com/file/pyq-pdfs
 *                       (bucket's friendly URL base, from the B2 bucket page)
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50 MB per paper

export function isPdfStorageConfigured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      process.env.S3_BUCKET_NAME &&
      process.env.S3_PUBLIC_URL_BASE
  );
}

/** B2 needs the real region for SigV4 — parse it from the endpoint host. */
function s3Region(endpoint: string): string {
  const m = /s3\.([^.]+)\.backblazeb2\.com/i.exec(endpoint);
  if (!m) {
    throw new Error(
      `Cannot determine S3 region from S3_ENDPOINT "${endpoint}". Expected a Backblaze B2 endpoint like https://s3.us-west-004.backblazeb2.com.`
    );
  }
  return m[1];
}

function s3Client(): S3Client {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "PDF storage is not configured. Set S3_ENDPOINT, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY."
    );
  }
  return new S3Client({
    region: s3Region(endpoint),
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

/** Public download URL for an object key (bucket must allow public reads). */
export function pdfPublicUrl(key: string): string {
  const base = process.env.S3_PUBLIC_URL_BASE;
  if (!base) {
    throw new Error("PDF storage is not configured. Set S3_PUBLIC_URL_BASE.");
  }
  return `${base.replace(/\/$/, "")}/${key}`;
}

export interface PyqUploadGrant {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

/**
 * Mint a short-lived presigned PUT URL for a PYQ paper PDF.
 * The browser PUTs the file directly to object storage; the returned
 * publicUrl is what gets saved on the quiz row.
 */
export async function createPyqUploadUrl(
  quizSlug: string,
  filename: string,
  sizeBytes: number
): Promise<PyqUploadGrant> {
  if (!isPdfStorageConfigured()) {
    throw new Error(
      "PDF storage is not configured. Add the S3 env vars in Vercel project settings."
    );
  }
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_PDF_BYTES) {
    throw new Error("PDF must be between 1 byte and 50 MB.");
  }
  const bucket = process.env.S3_BUCKET_NAME!;
  const slugPart = (quizSlug || "paper").toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 60) || "paper";
  const safeName =
    filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "paper.pdf";
  const key = `pyq/${slugPart}/${Date.now()}-${safeName}`;

  const uploadUrl = await getSignedUrl(
    s3Client(),
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: "application/pdf",
    }),
    { expiresIn: 600 } // 10 minutes to complete the upload
  );

  return { uploadUrl, publicUrl: pdfPublicUrl(key), key };
}
