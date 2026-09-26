/**
 * Cloudflare R2 object storage (S3-compatible API).
 *
 * PYQ question-paper PDFs are uploaded straight from the admin's browser to
 * R2 using a presigned PUT URL minted by `createPyqUploadUrl()` — the file
 * bytes never pass through Vercel, so the 4.5 MB serverless request-body
 * limit doesn't apply. Downloads serve directly from R2's public URL, so
 * Vercel bandwidth isn't consumed either.
 *
 * Required env vars (set in Vercel project settings):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_BUCKET_NAME, R2_PUBLIC_URL (e.g. https://pyq-pdfs.<id>.r2.dev)
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50 MB per paper

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL
  );
}

function r2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY."
    );
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/** Public download URL for an object key (bucket must allow public reads). */
export function r2PublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL;
  if (!base) {
    throw new Error("R2 storage is not configured. Set R2_PUBLIC_URL.");
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
 * The browser PUTs the file directly to R2; the returned publicUrl is what
 * gets saved on the quiz row.
 */
export async function createPyqUploadUrl(
  quizSlug: string,
  filename: string,
  sizeBytes: number
): Promise<PyqUploadGrant> {
  if (!isR2Configured()) {
    throw new Error(
      "R2 storage is not configured. Add the R2 env vars in Vercel project settings."
    );
  }
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_PDF_BYTES) {
    throw new Error("PDF must be between 1 byte and 50 MB.");
  }
  const bucket = process.env.R2_BUCKET_NAME!;
  const slugPart = (quizSlug || "paper").toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 60) || "paper";
  const safeName =
    filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "paper.pdf";
  const key = `pyq/${slugPart}/${Date.now()}-${safeName}`;

  const uploadUrl = await getSignedUrl(
    r2Client(),
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: "application/pdf",
    }),
    { expiresIn: 600 } // 10 minutes to complete the upload
  );

  return { uploadUrl, publicUrl: r2PublicUrl(key), key };
}
