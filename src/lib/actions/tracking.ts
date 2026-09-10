"use server";

import { createClient } from "@/lib/supabase/server";

export async function logPageView(path: string) {
  const supabase = await createClient();
  // Best-effort — never throw, tracking should never break the page.
  // (No .select() here: the anon role only has INSERT rights on this
  // table, not SELECT, so asking PostgREST to return the row would fail.)
  await supabase.from("page_views").insert({ path });
}

export async function incrementPostViews(slug: string) {
  const supabase = await createClient();
  await supabase.rpc("increment_post_views", { post_slug: slug });
}
