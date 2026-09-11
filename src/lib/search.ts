import { createClient } from "@/lib/supabase/server";
import type { Post, PscUpdate, Quiz } from "@/lib/types";

export interface SearchResults {
  posts: Post[];
  quizzes: Quiz[];
  pscUpdates: PscUpdate[];
}

/**
 * Simple ILIKE search across the three public content types. Good enough
 * for a site this size — if it ever needs to scale, Supabase's full-text
 * search (tsvector columns + a GIN index) would be the next step.
 */
export async function searchSite(rawQuery: string, limit = 8): Promise<SearchResults> {
  const query = rawQuery.trim();
  if (!query) return { posts: [], quizzes: [], pscUpdates: [] };

  const supabase = await createClient();
  const like = `%${query}%`;

  const [postsRes, quizzesRes, pscRes] = await Promise.all([
    supabase
      .from("posts")
      .select("*, category:categories(*)")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .or(`title.ilike.${like},excerpt.ilike.${like}`)
      .order("published_at", { ascending: false })
      .limit(limit),
    supabase
      .from("quizzes")
      .select("*, post:posts(id, title, slug), category:categories(*)")
      .eq("status", "published")
      .or(`title.ilike.${like},description.ilike.${like}`)
      .limit(limit),
    supabase
      .from("psc_updates")
      .select("*")
      .ilike("title", like)
      .order("scraped_at", { ascending: false })
      .limit(limit),
  ]);

  return {
    posts: (postsRes.data ?? []) as unknown as Post[],
    quizzes: (quizzesRes.data ?? []) as unknown as Quiz[],
    pscUpdates: (pscRes.data ?? []) as PscUpdate[],
  };
}
