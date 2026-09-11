import { createClient } from "@/lib/supabase/server";
import type { Quiz, QuizQuestion, QuizAttempt } from "@/lib/types";

const QUIZ_SELECT = "*, post:posts(id, title, slug), category:categories(*)";

export async function getPublishedQuizzes({
  categorySlug,
}: { categorySlug?: string } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("quizzes")
    .select(QUIZ_SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Quiz[];
}

export async function getQuizByPostId(postId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select(QUIZ_SELECT)
    .eq("post_id", postId)
    .eq("status", "published")
    .maybeSingle();
  if (error) return null;
  return data as unknown as Quiz | null;
}

export async function getQuizBySlug(slug: string) {
  const supabase = await createClient();
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select(QUIZ_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error || !quiz) return null;

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quiz.id)
    .order("position", { ascending: true });

  return {
    ...(quiz as unknown as Quiz),
    questions: (questions ?? []) as QuizQuestion[],
  };
}

export async function getLeaderboard(quizId: string, limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("quiz_id", quizId)
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as QuizAttempt[];
}

// ---- Admin helpers ----

export async function getAllQuizzesForAdmin() {
  const supabase = await createClient();
  const { data: quizzes, error } = await supabase
    .from("quizzes")
    .select(QUIZ_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, score, total");

  return (quizzes ?? []).map((q) => {
    const quizAttempts = (attempts ?? []).filter((a) => a.quiz_id === q.id);
    return {
      ...(q as unknown as Quiz),
      attempt_count: quizAttempts.length,
    };
  }) as Quiz[];
}

export async function getQuizByIdForAdmin(id: string) {
  const supabase = await createClient();
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select(QUIZ_SELECT)
    .eq("id", id)
    .single();
  if (error) return null;

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", id)
    .order("position", { ascending: true });

  return {
    ...(quiz as unknown as Quiz),
    questions: (questions ?? []) as QuizQuestion[],
  };
}

export async function getQuizStatsForAdmin() {  const supabase = await createClient();
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, score, total, quiz:quizzes(title)");

  const byQuiz = new Map<
    string,
    { title: string; count: number; totalScorePct: number }
  >();

  for (const a of attempts ?? []) {
    const quizTitle =
      (a as unknown as { quiz: { title: string } | null }).quiz?.title ??
      "Untitled quiz";
    const pct = a.total > 0 ? (a.score / a.total) * 100 : 0;
    const existing = byQuiz.get(a.quiz_id);
    if (existing) {
      existing.count += 1;
      existing.totalScorePct += pct;
    } else {
      byQuiz.set(a.quiz_id, { title: quizTitle, count: 1, totalScorePct: pct });
    }
  }

  const perQuiz = Array.from(byQuiz.entries()).map(([quizId, v]) => ({
    quizId,
    title: v.title,
    attempts: v.count,
    avgScorePct: Math.round(v.totalScorePct / v.count),
  }));

  const totalAttempts = attempts?.length ?? 0;

  return { perQuiz, totalAttempts };
}

export async function getRecentQuizAttempts(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*, quiz:quizzes(title, slug)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as (QuizAttempt & { quiz: { title: string; slug: string } | null })[];
}
