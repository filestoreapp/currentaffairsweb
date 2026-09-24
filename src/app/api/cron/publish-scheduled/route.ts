import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // refuse to run unconfigured
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/**
 * GET /api/cron/publish-scheduled
 * Flips scheduled posts whose publish time has arrived to "published".
 *
 * Why this exists: the public site reads posts through Row Level Security,
 * and the anon policy only exposes rows with status = 'published'. The post
 * page's "scheduled && published_at <= now" visibility check can therefore
 * never match — nothing in the app ever flips the status, so scheduled
 * posts would stay invisible forever. This cron is the missing flip.
 *
 * It deliberately does NOT post to Telegram: the scheduled Telegram
 * catch-up (daily 13:05 IST) handles channel announcements with its own
 * format. Flipping here keeps the two jobs independent and avoids
 * double-posting.
 *
 * Triggered on a schedule by Vercel Cron (see vercel.json), which sends
 * `Authorization: Bearer $CRON_SECRET` automatically when CRON_SECRET is
 * set as an env var.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  // Look ahead 10 minutes: this cron runs at 12:55 PM IST while the district
  // posts are scheduled for 1:00 PM IST. Flipping a few minutes early is safe —
  // the anon RLS policy still hides the row until published_at actually passes.
  const cutoff = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("posts")
    .update({ status: "published" })
    .eq("status", "scheduled")
    .lte("published_at", cutoff)
    .select("id, slug, title, published_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const flipped = data ?? [];
  revalidatePath("/current-affairs");
  for (const post of flipped) {
    revalidatePath(`/current-affairs/${post.slug}`);
  }

  return NextResponse.json({
    flipped: flipped.length,
    posts: flipped.map((p) => ({
      slug: p.slug,
      title: p.title,
      published_at: p.published_at,
    })),
  });
}
