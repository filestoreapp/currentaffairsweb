import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Anon-key client with NO cookie access. Use this for public, read-only
 * queries (published posts, quizzes, PSC updates, categories) instead of
 * the cookie-aware client in ./server.ts.
 *
 * Why this exists: calling cookies() anywhere in a render path (which the
 * server.ts client does, to read the auth session) forces that whole
 * route into fully dynamic rendering in Next.js — no static generation,
 * no ISR, and Vercel's CDN can't cache the response. For pages that never
 * need a user session (basically everything except /admin), that's pure
 * overhead: every visit re-fetches from Supabase from scratch.
 *
 * This client is safe for anon-readable data because Row Level Security
 * already grants `select` to the `anon` role for the tables it reads
 * (posts, categories, quizzes, quiz_questions, quiz_attempts,
 * psc_updates — see supabase/schema.sql). It must never be used for
 * anything that depends on *who* is logged in.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars"
    );
  }

  return createSupabaseClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
