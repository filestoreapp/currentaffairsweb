"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { submitQuizAttempt } from "@/lib/actions/quizzes";
import type { Quiz, QuizAttempt } from "@/lib/types";
import { CheckCircle2, XCircle, Loader2, Trophy, Timer, ClipboardList } from "lucide-react";

type Stage = "intro" | "playing" | "result";

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function QuizPlayer({
  quiz,
  initialLeaderboard,
}: {
  quiz: Quiz;
  initialLeaderboard: QuizAttempt[];
}) {
  const questions = quiz.questions ?? [];
  const [stage, setStage] = useState<Stage>("intro");
  const [name, setName] = useState("");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit_seconds ?? 0);
  const [timedOut, setTimedOut] = useState(false);
  const finishedRef = useRef(false);
  const scoreRef = useRef(score);
  const wrongRef = useRef(wrongCount);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    wrongRef.current = wrongCount;
  }, [wrongCount]);

  const question = questions[current];

  async function finishQuiz(finalScore: number) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setSubmitting(true);
    try {
      await submitQuizAttempt(quiz.id, name, finalScore, questions.length);
      const wrong = wrongRef.current;
      setLeaderboard((prev) =>
        [
          ...prev,
          {
            id: "temp",
            quiz_id: quiz.id,
            name,
            score: finalScore,
            total: questions.length,
            correct_count: finalScore,
            wrong_count: wrong,
            skipped_count: questions.length - finalScore - wrong,
            time_taken_seconds: null,
            answers: null,
            created_at: new Date().toISOString(),
          },
        ]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
      );
    } catch {
      // non-fatal — still show the result even if saving the score failed
    } finally {
      setSubmitting(false);
      setStage("result");
    }
  }

  // Countdown timer — only runs while playing a timed quiz.
  useEffect(() => {
    if (stage !== "playing" || !quiz.time_limit_seconds) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setTimedOut(true);
          finishQuiz(scoreRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function selectOption(index: number) {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    if (index === question.correct_index) {
      setScore((s) => s + 1);
    } else {
      setWrongCount((w) => w + 1);
    }
  }

  async function nextQuestion() {
    setSelected(null);
    setAnswered(false);
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
    } else {
      await finishQuiz(score);
    }
  }

  if (questions.length === 0) {
    return (
      <p className="mt-10 text-slate-500">
        This quiz has no questions yet. Check back soon.
      </p>
    );
  }

  if (stage === "intro") {
    return (
      <div className="mx-auto max-w-lg">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-center text-white sm:p-10">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-indigo-600/40 blur-3xl" />
            <div className="absolute -bottom-20 -right-12 h-56 w-56 rounded-full bg-violet-600/30 blur-3xl" />
          </div>
          <div className="relative">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-600/30">
              <ClipboardList size={26} className="text-white" />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-300">
                {quiz.description}
              </p>
            )}
            <div className="mt-5 flex items-center justify-center gap-2">
              <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-indigo-200">
                {questions.length} question{questions.length !== 1 ? "s" : ""}
              </span>
              {quiz.time_limit_seconds && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-300">
                  <Timer size={12} /> {Math.round(quiz.time_limit_seconds / 60)} min
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
          <label
            htmlFor="quiz-name"
            className="text-sm font-semibold text-slate-700"
          >
            Your name for the leaderboard
          </label>
          <input
            id="quiz-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Anjali K"
            maxLength={40}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            disabled={!name.trim()}
            onClick={() => {
              setTimeLeft(quiz.time_limit_seconds ?? 0);
              setStage("playing");
            }}
            className="mt-3 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:opacity-40 disabled:shadow-none"
          >
            Start Quiz →
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">
            No login needed — your score goes straight to the leaderboard.
          </p>
        </div>
      </div>
    );
  }

  if (stage === "playing") {
    return (
      <div className="mx-auto max-w-lg">
        <div className="mb-4 flex items-center justify-between text-sm font-medium text-slate-500">
          <span>
            Question {current + 1} of {questions.length}
          </span>
          <span className="flex items-center gap-3">
            {quiz.time_limit_seconds && (
              <span
                className={`flex items-center gap-1 font-semibold ${
                  timeLeft <= 10 ? "text-red-600" : "text-slate-600"
                }`}
              >
                <Timer size={14} /> {formatClock(timeLeft)}
              </span>
            )}
            <span>Score: {score}</span>
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">
            {question.question}
          </h2>

          <div className="mt-5 space-y-2">
            {question.options.map((option, i) => {
              const isCorrect = i === question.correct_index;
              const isSelected = i === selected;
              let style =
                "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50";
              if (answered && isCorrect) {
                style = "border-green-500 bg-green-50";
              } else if (answered && isSelected && !isCorrect) {
                style = "border-red-500 bg-red-50";
              }
              return (
                <button
                  key={i}
                  onClick={() => selectOption(i)}
                  disabled={answered}
                  className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium text-slate-700 ${style}`}
                >
                  {option}
                  {answered && isCorrect && (
                    <CheckCircle2 size={18} className="text-green-600" />
                  )}
                  {answered && isSelected && !isCorrect && (
                    <XCircle size={18} className="text-red-600" />
                  )}
                </button>
              );
            })}
          </div>

          {answered && question.explanation && (
            <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {question.explanation}
            </p>
          )}

          {answered && (
            <button
              onClick={nextQuestion}
              disabled={submitting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {current + 1 < questions.length ? "Next Question" : "See Results"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // stage === "result"
  const pct = Math.round((score / questions.length) * 100);
  const message =
    pct >= 80
      ? "Outstanding! PSC-ready performance."
      : pct >= 50
      ? "Good going — a little revision and you'll ace it."
      : "Keep practicing — every attempt makes you sharper.";
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-center text-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-12 h-56 w-56 rounded-full bg-indigo-600/30 blur-3xl" />
        </div>
        <div className="relative">
          <Trophy className="mx-auto text-amber-400" size={44} />
          <p className="mt-4 text-5xl font-extrabold tracking-tight">
            {score}
            <span className="text-2xl text-slate-400">/{questions.length}</span>
          </p>
          <p className="mt-2 text-sm font-semibold text-indigo-200">
            {pct}% · {name}
            {timedOut ? " · time ran out" : ""}
          </p>
          <p className="mx-auto mt-2 max-w-xs text-sm text-slate-300">
            {message}
          </p>
          <div className="mt-5 flex items-center justify-center gap-2.5">
            <Link
              href="/quiz"
              className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              More quizzes
            </Link>
            <Link
              href="/mock-tests"
              className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              Try a mock test
            </Link>
          </div>
        </div>
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
                a.id === "temp"
                  ? "bg-indigo-50 ring-1 ring-indigo-200"
                  : "bg-slate-50"
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
              <span className="font-semibold text-indigo-600">
                {a.score}/{a.total}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
