"use client";

import { useEffect, useRef, useState } from "react";
import { submitMockAttempt } from "@/lib/actions/quizzes";
import type { Quiz, QuizAttempt, QuizQuestion } from "@/lib/types";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Loader2,
  Trophy,
  Timer,
  Flag,
  ChevronLeft,
  ChevronRight,
  ListChecks,
} from "lucide-react";

type Stage = "intro" | "playing" | "confirm" | "result";

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

interface ReviewItem {
  question: QuizQuestion;
  selected: number | null;
  isCorrect: boolean;
  isSkipped: boolean;
}

export default function MockTestPlayer({
  quiz,
  initialLeaderboard,
}: {
  quiz: Quiz;
  initialLeaderboard: QuizAttempt[];
}) {
  const questions = quiz.questions ?? [];
  const negMark = Number(quiz.negative_marking ?? 0);

  const [stage, setStage] = useState<Stage>("intro");
  const [name, setName] = useState("");
  const [current, setCurrent] = useState(0);
  // selected[i] = chosen option index for question i, or null
  const [selected, setSelected] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [marked, setMarked] = useState<boolean[]>(
    Array(questions.length).fill(false)
  );
  const [showPalette, setShowPalette] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit_seconds ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);

  // result state
  const [review, setReview] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState({
    score: 0,
    correct: 0,
    wrong: 0,
    skipped: 0,
    timeTaken: 0,
    rank: 0,
    totalAttempts: 0,
  });

  const finishedRef = useRef(false);
  const selectedRef = useRef(selected);
  const markedRef = useRef(marked);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  useEffect(() => {
    markedRef.current = marked;
  }, [marked]);

  async function finishTest(timedOut: boolean) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setSubmitting(true);

    const answers = selectedRef.current;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const items: ReviewItem[] = questions.map((q, i) => {
      const sel = answers[i];
      if (sel === null || sel === undefined) {
        skipped += 1;
        return { question: q, selected: null, isCorrect: false, isSkipped: true };
      }
      const ok = sel === q.correct_index;
      if (ok) correct += 1;
      else wrong += 1;
      return { question: q, selected: sel, isCorrect: ok, isSkipped: false };
    });

    const rawScore = correct * 1 - wrong * negMark;
    const score = Math.round(rawScore * 100) / 100;
    const timeTaken = quiz.time_limit_seconds
      ? quiz.time_limit_seconds - timeLeftRef.current
      : 0;

    try {
      await submitMockAttempt({
        quizId: quiz.id,
        name,
        answers,
        correctCount: correct,
        wrongCount: wrong,
        skippedCount: skipped,
        score,
        total: questions.length,
        timeTakenSeconds: Math.max(0, timeTaken),
      });
    } catch {
      // non-fatal — still show the result even if saving failed
    }

    // Rank: position this score would take on the leaderboard
    // (score desc, faster finish wins ties).
    const entry = {
      id: "temp",
      quiz_id: quiz.id,
      name,
      score,
      total: questions.length,
      correct_count: correct,
      wrong_count: wrong,
      skipped_count: skipped,
      time_taken_seconds: Math.max(0, timeTaken),
      answers,
      created_at: new Date().toISOString(),
    };
    const merged = [...initialLeaderboard, entry].sort((a, b) => {
      if (Number(b.score) !== Number(a.score))
        return Number(b.score) - Number(a.score);
      const ta = a.time_taken_seconds ?? Number.MAX_SAFE_INTEGER;
      const tb = b.time_taken_seconds ?? Number.MAX_SAFE_INTEGER;
      return ta - tb;
    });
    const rank = merged.findIndex((a) => a.id === "temp") + 1;

    setLeaderboard(merged.slice(0, 20));
    setReview(items);
    setStats({
      score,
      correct,
      wrong,
      skipped,
      timeTaken: Math.max(0, timeTaken),
      rank,
      totalAttempts: merged.length,
    });
    setSubmitting(false);
    setStage("result");
    if (timedOut) {
      // surface the timeout in the result header via the flag below
      setTimedOutFlag(true);
    }
  }

  const [timedOutFlag, setTimedOutFlag] = useState(false);
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Countdown — only while playing a timed mock.
  useEffect(() => {
    if (stage !== "playing" || !quiz.time_limit_seconds) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          finishTest(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function toggleSelect(qi: number, oi: number) {
    setSelected((prev) =>
      prev.map((s, i) => (i === qi ? (s === oi ? null : oi) : s))
    );
  }

  function toggleMark(qi: number) {
    setMarked((prev) => prev.map((m, i) => (i === qi ? !m : m)));
  }

  const answeredCount = selected.filter((s) => s !== null).length;

  if (questions.length === 0) {
    return (
      <p className="mt-10 text-slate-500">
        This mock test has no questions yet. Check back soon.
      </p>
    );
  }

  // ---------- INTRO ----------
  if (stage === "intro") {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8">
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
          Mock Test
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900">
          {quiz.title}
        </h1>
        {quiz.description && (
          <p className="mt-2 text-sm text-slate-500">{quiz.description}</p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xl font-extrabold text-slate-900">
              {questions.length}
            </p>
            <p className="text-xs text-slate-500">Questions</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xl font-extrabold text-slate-900">
              {quiz.time_limit_seconds
                ? `${Math.round(quiz.time_limit_seconds / 60)}m`
                : "—"}
            </p>
            <p className="text-xs text-slate-500">Duration</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xl font-extrabold text-slate-900">
              {negMark > 0 ? `−${negMark}` : "0"}
            </p>
            <p className="text-xs text-slate-500">Negative mark</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Marking scheme</p>
          <p className="mt-0.5">
            +1 for every correct answer
            {negMark > 0
              ? `, −${negMark} for every wrong answer`
              : ", no negative marking"}
            . Skipped questions score 0. Answers are revealed only after you
            submit — just like the real exam.
          </p>
        </div>

        {quiz.instructions && (
          <div className="mt-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Instructions</p>
            <p className="mt-1 whitespace-pre-line">{quiz.instructions}</p>
          </div>
        )}

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name for the leaderboard"
          maxLength={60}
          className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          disabled={!name.trim()}
          onClick={() => {
            setTimeLeft(quiz.time_limit_seconds ?? 0);
            timeLeftRef.current = quiz.time_limit_seconds ?? 0;
            setStage("playing");
          }}
          className="mt-4 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Start Test
        </button>
      </div>
    );
  }

  // ---------- RESULT ----------
  if (stage === "result") {
    const pct =
      questions.length > 0
        ? Math.round((stats.correct / questions.length) * 100)
        : 0;
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <Trophy className="mx-auto text-amber-500" size={40} />
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
            {stats.score} / {questions.length}
          </h2>
          <p className="mt-1 text-slate-500">
            {name}, you ranked <strong>#{stats.rank}</strong> of{" "}
            {stats.totalAttempts}
            {timedOutFlag ? " — time ran out!" : ""}
          </p>
          <div className="mx-auto mt-5 grid max-w-md grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-xl bg-green-50 p-3">
              <p className="text-lg font-extrabold text-green-700">
                {stats.correct}
              </p>
              <p className="text-xs text-green-600">Correct</p>
            </div>
            <div className="rounded-xl bg-red-50 p-3">
              <p className="text-lg font-extrabold text-red-700">{stats.wrong}</p>
              <p className="text-xs text-red-600">Wrong</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-3">
              <p className="text-lg font-extrabold text-slate-700">
                {stats.skipped}
              </p>
              <p className="text-xs text-slate-500">Skipped</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3">
              <p className="text-lg font-extrabold text-indigo-700">{pct}%</p>
              <p className="text-xs text-indigo-600">Accuracy</p>
            </div>
          </div>
          {quiz.time_limit_seconds ? (
            <p className="mt-4 flex items-center justify-center gap-1 text-sm text-slate-500">
              <Timer size={14} /> Finished in {formatDuration(stats.timeTaken)}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Trophy size={16} className="text-amber-500" /> Leaderboard
          </h3>
          <ol className="mt-4 space-y-2">
            {leaderboard.map((a, i) => (
              <li
                key={a.id + i}
                className={`flex items-center justify-between rounded-lg px-4 py-2 text-sm ${
                  a.id === "temp" ? "bg-indigo-50 ring-1 ring-indigo-200" : "bg-slate-50"
                }`}
              >
                <span className="font-medium text-slate-700">
                  {i + 1}. {a.name}
                  {a.id === "temp" && (
                    <span className="ml-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      YOU
                    </span>
                  )}
                </span>
                <span className="text-right">
                  <span className="font-semibold text-indigo-600">
                    {Number(a.score)}/{a.total}
                  </span>
                  {a.time_taken_seconds != null && a.time_taken_seconds > 0 && (
                    <span className="ml-2 text-xs text-slate-400">
                      {formatDuration(a.time_taken_seconds)}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <ListChecks size={16} className="text-indigo-600" /> Answer Review
          </h3>
          <div className="mt-4 space-y-4">
            {review.map((r, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <p className="flex items-start gap-2 text-sm font-semibold text-slate-800">
                  {r.isSkipped ? (
                    <MinusCircle size={16} className="mt-0.5 shrink-0 text-slate-400" />
                  ) : r.isCorrect ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" />
                  ) : (
                    <XCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                  )}
                  <span>
                    Q{i + 1}. {r.question.question}
                  </span>
                </p>
                <div className="mt-2 space-y-1 pl-6 text-sm">
                  {r.question.options.map((opt, oi) => {
                    const isCorrectOpt = oi === r.question.correct_index;
                    const isSelectedOpt = oi === r.selected;
                    return (
                      <p
                        key={oi}
                        className={
                          isCorrectOpt
                            ? "font-medium text-green-700"
                            : isSelectedOpt
                              ? "font-medium text-red-600 line-through"
                              : "text-slate-500"
                        }
                      >
                        {String.fromCharCode(65 + oi)}. {opt}
                        {isCorrectOpt && " ✓"}
                        {isSelectedOpt && !isCorrectOpt && " (your answer)"}
                      </p>
                    );
                  })}
                </div>
                {r.question.explanation && (
                  <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs text-slate-600">
                    {r.question.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- PLAYING ----------
  const question = questions[current];
  const sel = selected[current];

  return (
    <div className="mx-auto max-w-3xl">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-slate-500">
          Question {current + 1} of {questions.length}
          <span className="ml-3 text-indigo-600">
            {answeredCount} answered
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPalette((v) => !v)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            {showPalette ? "Hide" : "Show"} palette
          </button>
          {quiz.time_limit_seconds ? (
            <span
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold ${
                timeLeft <= 60
                  ? "bg-red-50 text-red-600"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              <Timer size={14} /> {formatClock(timeLeft)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-indigo-600 transition-all"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>

      {/* Question palette */}
      {showPalette && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
            {questions.map((_, i) => {
              const answered = selected[i] !== null;
              const isMarked = marked[i];
              const isCurrent = i === current;
              let cls = "bg-slate-100 text-slate-500 hover:bg-slate-200";
              if (answered) cls = "bg-indigo-600 text-white";
              else if (isMarked) cls = "bg-amber-400 text-white";
              return (
                <button
                  key={i}
                  onClick={() => {
                    setCurrent(i);
                    setShowPalette(false);
                  }}
                  className={`rounded-lg py-1.5 text-xs font-bold ${cls} ${
                    isCurrent ? "ring-2 ring-indigo-400 ring-offset-1" : ""
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-indigo-600" /> Answered
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-amber-400" /> Marked for review
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-slate-200" /> Not answered
            </span>
          </div>
        </div>
      )}

      {/* Current question */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">
          {question.question}
        </h2>

        <div className="mt-5 space-y-2">
          {question.options.map((option, oi) => {
            const isSel = sel === oi;
            return (
              <button
                key={oi}
                onClick={() => toggleSelect(current, oi)}
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium ${
                  isSel
                    ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                    : "border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                    isSel
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 text-slate-500"
                  }`}
                >
                  {String.fromCharCode(65 + oi)}
                </span>
                {option}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Click an option again to clear your answer.
        </p>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <button
            onClick={() => toggleMark(current)}
            className={`flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-semibold ${
              marked[current]
                ? "border-amber-400 bg-amber-50 text-amber-700"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Flag size={14} /> {marked[current] ? "Marked" : "Mark for review"}
          </button>

          {current + 1 < questions.length ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => setStage("confirm")}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Submit test
            </button>
          )}
        </div>
      </div>

      {/* Submit confirmation */}
      {stage === "playing" && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setStage("confirm")}
            disabled={submitting}
            className="text-sm font-semibold text-slate-500 underline hover:text-slate-700"
          >
            Submit test now
          </button>
        </div>
      )}

      {stage === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center">
            <h3 className="text-lg font-bold text-slate-900">Submit test?</h3>
            <p className="mt-2 text-sm text-slate-500">
              You answered {answeredCount} of {questions.length} questions.
              {marked.some(Boolean) &&
                ` ${marked.filter(Boolean).length} marked for review.`}{" "}
              You can't change answers after submitting.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setStage("playing")}
                disabled={submitting}
                className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Keep solving
              </button>
              <button
                onClick={() => finishTest(false)}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
