import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { Post, Category } from "@/lib/types";

const POST_SELECT = "*, category:categories(*)";

// ---- Public (anon, cacheable) helpers ----

export async function getPublishedPosts({
  page = 1,
  perPage = 12,
  categorySlug,
}: {
  page?: number;
  perPage?: number;
  categorySlug?: string;
} = {}) {
  const supabase = createPublicClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("posts")
    .select(POST_SELECT, { count: "exact" })
    .in("status", ["published", "scheduled"])
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .range(from, to);

  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  const { data, count, error } = await query;
  if (error) throw error;
  return { posts: (data ?? []) as unknown as Post[], count: count ?? 0 };
}

export async function getLatestPosts(limit = 6) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .in("status", ["published", "scheduled"])
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as Post[];
}

export async function getPostBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as unknown as Post;
}

export async function getAllCategories() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Category[];
}

// ---- Admin (authenticated, always-dynamic) helpers ----

export async function getAllPostsForAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Post[];
}

export async function getPostByIdForAdmin(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .single();
  if (error) return null;
  return data as unknown as Post;
}
