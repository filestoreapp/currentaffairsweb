import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * POST /api/internal/revalidate  { secret, paths: ["/mock-tests/x", ...] }
 *
 * Lets the Koyeb backend worker trigger on-demand ISR revalidation after it
 * flips scheduled content to published directly in Supabase. Without this,
 * a Telegram announcement could link to a page that 404s for up to 5
 * minutes (the public pages use `revalidate = 300`).
 *
 * Shared secret: REVALIDATE_SECRET env var (must match the worker's
 * CA_REVALIDATE_SECRET). Paths are restricted to site-local paths.
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  let body: { secret?: unknown; paths?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (!secret || body.secret !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const paths = Array.isArray(body.paths)
    ? body.paths.filter(
        (p): p is string => typeof p === "string" && p.startsWith("/") && !p.includes("..")
      )
    : [];
  for (const p of paths.slice(0, 20)) {
    revalidatePath(p);
  }
  return NextResponse.json({ ok: true, revalidated: paths.length });
}
