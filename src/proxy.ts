import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Only /admin routes need the auth-cookie check. Running it on every
  // public page (posts, quizzes, search, PSC updates) added an extra
  // Supabase round-trip to requests that never needed a session at all,
  // and forced those pages to skip static/ISR caching.
  matcher: ["/admin/:path*"],
};
