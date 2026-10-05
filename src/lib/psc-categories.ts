import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { PaperSection } from "@/lib/types";

export interface PscCategory {
  id: string;
  cat_no: string;
  slug: string;
  post_name: string;
  department: string | null;
  announcement_type: string | null;
  list_no: string | null;
  list_date: string | null;
  exam_date: string | null;
  details: string | null;
  source_url: string | null;
  paper_sections: PaperSection[];
  exam_slug: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const SELECT = "*";

// ---- Public (anon, cacheable) helpers ----
// These degrade to empty results when the `psc_categories` table doesn't
// exist yet (migration not run), so the site never 500s.

export async function getPublishedPscCategories(): Promise<PscCategory[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("psc_categories")
      .select(SELECT)
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as PscCategory[];
  } catch {
    return [];
  }
}

export async function getPscCategoryBySlug(
  slug: string
): Promise<PscCategory | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("psc_categories")
      .select(SELECT)
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw error;
    return (data ?? null) as PscCategory | null;
  } catch {
    return null;
  }
}

export async function getPscCategorySlugs(): Promise<string[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("psc_categories")
      .select("slug")
      .eq("is_published", true);
    if (error) throw error;
    return (data ?? []).map((r) => (r as { slug: string }).slug);
  } catch {
    return [];
  }
}

export async function getPscCategoriesByExamSlug(
  examSlug: string
): Promise<PscCategory[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("psc_categories")
      .select(SELECT)
      .eq("exam_slug", examSlug)
      .eq("is_published", true)
      .order("cat_no", { ascending: true });
    if (error) throw error;
    return (data ?? []) as PscCategory[];
  } catch {
    return [];
  }
}

// ---- Admin (authenticated) helpers ----

export async function getPscCategoriesForAdmin(): Promise<PscCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("psc_categories")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PscCategory[];
}

export async function getPscCategoryByIdForAdmin(
  id: string
): Promise<PscCategory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("psc_categories")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as PscCategory | null;
}
