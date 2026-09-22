import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { Quiz, QuizQuestion, QuizAttempt } from "@/lib/types";

const QUIZ_SELECT = "*, post:posts(id, title, slug), category:categories(*)";

// ---- Public (anon, cacheable) helpers ----

export async function getPublishedQuizzes({
  categorySlug,
}: { categorySlug?: string } = {}) {
  const supabase = createPublicClient();
  let query = supabase
    .from("quizzes")
    .select(QUIZ_SELECT)
    .eq("status", "published")
    .eq("is_mock", false)
    .eq("is_pyq", false)
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
  const supabase = createPublicClient();
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
  const supabase = createPublicClient();
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
  const supabase = createPublicClient();
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

// ---- Mock tests (exam-style: palette, timer, negative marking, rank) ----

export async function getPublishedMocks() {
  const supabase = createPublicClient();
  const { data: mocks, error } = await supabase
    .from("quizzes")
    .select(QUIZ_SELECT)
    .eq("status", "published")
    .eq("is_mock", true)
    .eq("is_pyq", false)
    .order("created_at", { ascending: false });
  if (error) throw error;

  // Attempt counts per mock for the listing cards.
  const ids = (mocks ?? []).map((m) => m.id);
  let counts: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("quiz_id")
      .in("quiz_id", ids);
    counts = (attempts ?? []).reduce<Record<string, number>>((acc, a) => {
      acc[a.quiz_id] = (acc[a.quiz_id] ?? 0) + 1;
      return acc;
    }, {});
  }

  return ((mocks ?? []) as unknown as Quiz[]).map((m) => ({
    ...m,
    attempt_count: counts[m.id] ?? 0,
  }));
}

export async function getMockBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select(QUIZ_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_mock", true)
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

/** Ranked leaderboard for a mock: highest score first, ties broken by fastest finish. */
export async function getMockLeaderboard(quizId: string, limit = 20) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("quiz_id", quizId)
    .order("score", { ascending: false })
    .order("time_taken_seconds", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as QuizAttempt[];
}

export interface GlobalLeaderboardEntry {
  name: string;
  mocks_attempted: number;
  avg_score_pct: number;
  best_score_pct: number;
}

/**
 * Cross-mock leaderboard: for each name take their best percentage on
 * each mock, then average across mocks. Rewards consistent performers,
 * not just one lucky attempt.
 */
export async function getGlobalMockLeaderboard(
  limit = 20
): Promise<GlobalLeaderboardEntry[]> {
  const supabase = createPublicClient();
  const { data: mocks } = await supabase
    .from("quizzes")
    .select("id")
    .eq("status", "published")
    .eq("is_mock", true)
    .eq("is_pyq", false);
  const ids = (mocks ?? []).map((m) => m.id);
  if (ids.length === 0) return [];

  const { data: attempts, error } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, name, score, total")
    .in("quiz_id", ids);
  if (error) throw error;

  // best percentage per (name, mock)
  const best = new Map<string, Map<string, number>>(); // name -> mockId -> pct
  for (const a of attempts ?? []) {
    if (!a.total || a.total <= 0) continue;
    const pct = Math.max(0, (Number(a.score) / a.total) * 100);
    let perMock = best.get(a.name);
    if (!perMock) {
      perMock = new Map();
      best.set(a.name, perMock);
    }
    const prev = perMock.get(a.quiz_id) ?? -1;
    if (pct > prev) perMock.set(a.quiz_id, pct);
  }

  return Array.from(best.entries())
    .map(([name, perMock]) => {
      const pcts = Array.from(perMock.values());
      return {
        name,
        mocks_attempted: pcts.length,
        avg_score_pct: Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length),
        best_score_pct: Math.round(Math.max(...pcts)),
      };
    })
    .sort((a, b) => b.avg_score_pct - a.avg_score_pct || b.mocks_attempted - a.mocks_attempted)
    .slice(0, limit);
}

// ---- Admin (authenticated, always-dynamic) helpers ----

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

export async function getQuizStatsForAdmin() {
  const supabase = await createClient();
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

// ---- PYQ papers (previous-year Kerala PSC papers, exam-style runner) ----

export async function getPublishedPyqs() {
  const supabase = createPublicClient();
  const { data: papers, error } = await supabase
    .from("quizzes")
    .select(QUIZ_SELECT)
    .eq("status", "published")
    .eq("is_pyq", true)
    .order("exam_year", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;

  const ids = (papers ?? []).map((p) => p.id);
  let counts: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("quiz_id")
      .in("quiz_id", ids);
    counts = (attempts ?? []).reduce<Record<string, number>>((acc, a) => {
      acc[a.quiz_id] = (acc[a.quiz_id] ?? 0) + 1;
      return acc;
    }, {});
  }

  return ((papers ?? []) as unknown as Quiz[]).map((p) => ({
    ...p,
    attempt_count: counts[p.id] ?? 0,
  }));
}

export async function getPyqBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select(QUIZ_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_pyq", true)
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

/** Distinct exam years present among published PYQ papers (for filter chips). */
export async function getPyqYears(): Promise<number[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("exam_year")
    .eq("status", "published")
    .eq("is_pyq", true)
    .not("exam_year", "is", null);
  if (error) throw error;
  const years = Array.from(
    new Set((data ?? []).map((r) => r.exam_year as number))
  );
  return years.sort((a, b) => b - a);
}

// ---- Daily streaks (consecutive days with at least one attempt) ----

export interface StreakEntry {
  name: string;
  streak: number;
  last_active: string; // YYYY-MM-DD
}

/**
 * Top daily streaks across all quiz + mock + PYQ attempts, computed in JS:
 * for each name, count consecutive days (IST) ending today/yesterday with
 * at least one attempt.
 */
export async function getTopStreaks(limit = 10): Promise<StreakEntry[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("name, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw error;

  // Distinct active days per name (IST calendar days).
  const daysByName = new Map<string, Set<string>>();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  for (const row of data ?? []) {
    const day = fmt.format(new Date(row.created_at));
    let set = daysByName.get(row.name);
    if (!set) {
      set = new Set();
      daysByName.set(row.name, set);
    }
    set.add(day);
  }

  const todayStr = fmt.format(new Date());
  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayStr = fmt.format(yesterday);

  const entries: StreakEntry[] = [];
  for (const [name, days] of daysByName) {
    // Streak is live only if active today or yesterday.
    let cursor: Date;
    if (days.has(todayStr)) cursor = new Date();
    else if (days.has(yesterdayStr)) cursor = yesterday;
    else continue;

    let streak = 0;
    for (;;) {
      if (days.has(fmt.format(cursor))) {
        streak += 1;
        cursor = new Date(cursor.getTime() - 86400000);
      } else break;
    }
    if (streak > 0) {
      entries.push({
        name,
        streak,
        last_active: days.has(todayStr) ? todayStr : yesterdayStr,
      });
    }
  }

  return entries
    .sort((a, b) => b.streak - a.streak || a.name.localeCompare(b.name))
    .slice(0, limit);
}
