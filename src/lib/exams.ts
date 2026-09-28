import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { Exam, PscUpdate, Quiz } from "@/lib/types";

const QUIZ_CARD_SELECT =
  "id,title,slug,description,is_mock,is_pyq,exam_slug,created_at";

// ---- Public (anon, cacheable) helpers ----
// These degrade to empty results when the `exams` table / `exam_slug`
// columns don't exist yet (migration not run), so the site never 500s.

export async function getPublishedExams(): Promise<Exam[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("is_published", true)
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Exam[];
  } catch {
    return [];
  }
}

export async function getExamBySlug(slug: string): Promise<Exam | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw error;
    return data as Exam | null;
  } catch {
    return null;
  }
}

export interface ExamRelatedContent {
  mocks: Quiz[];
  pyqs: Quiz[];
  quizzes: Quiz[];
  updates: PscUpdate[];
}

/** Quizzes/mocks/PYQs tagged to this exam + PSC notifications for it. */
export async function getExamRelatedContent(
  exam: Exam
): Promise<ExamRelatedContent> {
  const supabase = createPublicClient();
  const empty: ExamRelatedContent = { mocks: [], pyqs: [], quizzes: [], updates: [] };
  try {
    const { data: tagged, error: qErr } = await supabase
      .from("quizzes")
      .select(QUIZ_CARD_SELECT)
      .eq("status", "published")
      .eq("exam_slug", exam.slug)
      .order("created_at", { ascending: false })
      .limit(24);
    if (qErr) throw qErr;
    for (const q of (tagged ?? []) as Quiz[]) {
      if (q.is_mock) empty.mocks.push(q);
      else if (q.is_pyq) empty.pyqs.push(q);
      else empty.quizzes.push(q);
    }
  } catch {
    // exam_slug column may not exist yet — related quizzes just stay empty.
  }

  try {
    let query = supabase
      .from("psc_updates")
      .select("*")
      .order("published_on", { ascending: false, nullsFirst: false })
      .order("scraped_at", { ascending: false })
      .limit(10);
    if (exam.category_no) {
      query = query.or(
        `exam_slug.eq.${exam.slug},category_number.eq.${exam.category_no}`
      );
    } else {
      query = query.eq("exam_slug", exam.slug);
    }
    const { data, error } = await query;
    if (error) throw error;
    empty.updates = (data ?? []) as PscUpdate[];
  } catch {
    // ignore — notifications section just stays empty.
  }
  return empty;
}

// ---- Admin helpers (authenticated) ----

export async function getExamsForAdmin(): Promise<Exam[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Exam[];
}

export async function getExamByIdForAdmin(id: string): Promise<Exam | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Exam | null;
}
