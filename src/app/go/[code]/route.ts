import { NextResponse } from "next/server";
import { recordShortLinkClick, resolveShortLink } from "@/lib/short-links";

export const dynamic = "force-dynamic";

const CODE_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;

/**
 * GET /go/<code> — redirect to the link's target and count the click in
 * Neon. 302, never 301: links must stay re-pointable and every visit must
 * pass through here to be counted. Unknown codes 404.
 *
 * The click is recorded before redirecting, but a Neon failure must never
 * break the redirect — it is caught and logged, and the visitor still
 * reaches the target.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!CODE_RE.test(code)) {
    return NextResponse.json({ error: "Short link not found." }, { status: 404 });
  }

  let target: string | null = null;
  try {
    target = await resolveShortLink(code);
  } catch (err) {
    console.error(
      "Short link lookup failed:",
      err instanceof Error ? err.message : err
    );
  }

  if (!target) {
    return NextResponse.json({ error: "Short link not found." }, { status: 404 });
  }

  try {
    await recordShortLinkClick(code);
  } catch (err) {
    console.error(
      "Short link click count failed:",
      err instanceof Error ? err.message : err
    );
  }

  return NextResponse.redirect(target, 302);
}
