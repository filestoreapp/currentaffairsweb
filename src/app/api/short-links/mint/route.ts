import { NextResponse, type NextRequest } from "next/server";
import { mintShortLink, ShortLinkError } from "@/lib/short-links";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/short-links/mint  { target_url, label?, alias? }
 * -> { ok: true, code, short_url }
 *
 * Auth: the shared worker secret, `Authorization: Bearer <WORKER_SECRET>`
 * — the same secret the Koyeb worker already holds, so the worker (and any
 * future server-side caller) can mint links without an admin session. The
 * admin page uses a session-checked server action instead (see
 * src/lib/actions/short-links.ts). Refuses to run when WORKER_SECRET is
 * not set, exactly like the CRON_SECRET route.
 */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.WORKER_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { target_url?: unknown; label?: unknown; alias?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const targetUrl = typeof body.target_url === "string" ? body.target_url : "";
  const label = typeof body.label === "string" ? body.label : "";
  const alias =
    typeof body.alias === "string" && body.alias.trim()
      ? body.alias.trim()
      : undefined;

  if (!targetUrl) {
    return NextResponse.json(
      { error: "target_url is required." },
      { status: 400 }
    );
  }

  try {
    const { code, shortUrl } = await mintShortLink(targetUrl, label, alias);
    return NextResponse.json({ ok: true, code, short_url: shortUrl });
  } catch (err) {
    if (err instanceof ShortLinkError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(
      "Short link mint failed:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Could not create the short link." },
      { status: 500 }
    );
  }
}
