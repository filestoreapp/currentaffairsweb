/**
 * Personal game progress — points, daily streaks and badges.
 *
 * Quizzes and mocks are anonymous (no accounts, no sign-ups), so progress
 * lives in the visitor's own browser (localStorage), following the same
 * pattern as the syllabus tracker. Points and streaks are only ever
 * recorded from a real completed quiz/mock — see `recordCompletion`,
 * which the players call exactly once per finish.
 */

export const GAME_STORAGE_KEY = "psc-game-progress-v1";

export interface GameStats {
  points: number;
  quizzesCompleted: number;
  mocksCompleted: number;
  perfectCount: number;
  bestPct: number;
  /** IST calendar day (YYYY-MM-DD) of the last completed quiz/mock. */
  lastPlayedDay: string | null;
  streak: number;
  longestStreak: number;
  totalCorrect: number;
  totalQuestions: number;
}

export const EMPTY_STATS: GameStats = {
  points: 0,
  quizzesCompleted: 0,
  mocksCompleted: 0,
  perfectCount: 0,
  bestPct: 0,
  lastPlayedDay: null,
  streak: 0,
  longestStreak: 0,
  totalCorrect: 0,
  totalQuestions: 0,
};

export interface Badge {
  id: string;
  label: string;
  desc: string;
  earned: (s: GameStats) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: "first-step",
    label: "ആദ്യ ചുവട്",
    desc: "First quiz or mock completed",
    earned: (s) => s.quizzesCompleted + s.mocksCompleted >= 1,
  },
  {
    id: "streak-3",
    label: "3 ദിവസം",
    desc: "3-day streak",
    earned: (s) => s.longestStreak >= 3,
  },
  {
    id: "streak-7",
    label: "7 ദിവസം",
    desc: "7-day streak",
    earned: (s) => s.longestStreak >= 7,
  },
  {
    id: "points-100",
    label: "100 പോയിന്റ്",
    desc: "100 points earned",
    earned: (s) => s.points >= 100,
  },
  {
    id: "points-500",
    label: "500 പോയിന്റ്",
    desc: "500 points earned",
    earned: (s) => s.points >= 500,
  },
  {
    id: "points-1000",
    label: "1000 പോയിന്റ്",
    desc: "1000 points earned",
    earned: (s) => s.points >= 1000,
  },
  {
    id: "perfect",
    label: "പെർഫെക്റ്റ്",
    desc: "A perfect score",
    earned: (s) => s.perfectCount >= 1,
  },
  {
    id: "mocks-10",
    label: "10 മോക്കുകൾ",
    desc: "10 mock tests completed",
    earned: (s) => s.mocksCompleted >= 10,
  },
  {
    id: "quizzes-25",
    label: "25 ക്വിസുകൾ",
    desc: "25 quizzes completed",
    earned: (s) => s.quizzesCompleted >= 25,
  },
];

export function earnedBadges(s: GameStats): Badge[] {
  return BADGES.filter((b) => b.earned(s));
}

/** IST calendar day (YYYY-MM-DD) for an epoch-ms instant. */
export function istDayOf(ms: number): string {
  return new Date(ms).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function readStored(): GameStats {
  if (typeof window === "undefined") return { ...EMPTY_STATS };
  try {
    const raw = window.localStorage.getItem(GAME_STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATS };
    const parsed = JSON.parse(raw) as Partial<GameStats>;
    return { ...EMPTY_STATS, ...parsed };
  } catch {
    return { ...EMPTY_STATS };
  }
}

function writeStored(stats: GameStats): void {
  try {
    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // storage unavailable (private mode, quota) — progress just won't persist
  }
}

export function loadProgress(): GameStats {
  return readStored();
}

/**
 * Record one genuinely completed quiz or mock. Points: 10 per correct
 * answer, +50 for a perfect score. Streak counts consecutive IST days
 * with at least one completion. Returns the new stats plus any badges
 * earned by this completion.
 */
export function recordCompletion(
  kind: "quiz" | "mock",
  correct: number,
  total: number
): { stats: GameStats; newBadges: Badge[] } {
  const before = readStored();
  const beforeEarned = new Set(earnedBadges(before).map((b) => b.id));

  const today = istDayOf(Date.now());
  const yesterday = istDayOf(Date.now() - 86400000);
  let streak = before.streak;
  if (before.lastPlayedDay === today) {
    streak = before.streak; // already played today — streak unchanged
  } else if (before.lastPlayedDay === yesterday) {
    streak = before.streak + 1;
  } else {
    streak = 1;
  }

  const perfect = total > 0 && correct >= total;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  const stats: GameStats = {
    ...before,
    points: before.points + correct * 10 + (perfect ? 50 : 0),
    quizzesCompleted:
      before.quizzesCompleted + (kind === "quiz" ? 1 : 0),
    mocksCompleted: before.mocksCompleted + (kind === "mock" ? 1 : 0),
    perfectCount: before.perfectCount + (perfect ? 1 : 0),
    bestPct: Math.max(before.bestPct, pct),
    lastPlayedDay: today,
    streak,
    longestStreak: Math.max(before.longestStreak, streak),
    totalCorrect: before.totalCorrect + correct,
    totalQuestions: before.totalQuestions + total,
  };
  writeStored(stats);

  const newBadges = earnedBadges(stats).filter((b) => !beforeEarned.has(b.id));
  return { stats, newBadges };
}
