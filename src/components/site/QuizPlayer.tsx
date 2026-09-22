"use client";

import { useEffect, useRef, useState } from "react";
import { submitQuizAttempt } from "@/lib/actions/quizzes";
import type { Quiz, QuizAttempt } from "@/lib/types";
import { CheckCircle2, XCircle, Loader2, Trophy, Timer } from "lucide-react";

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
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-extrabold">{quiz.title}</h1>
        {quiz.description && (
          <p className="mt-2 text-sm text-slate-500">{quiz.description}</p>
        )}
        <p className="mt-4 flex items-center justify-center gap-3 text-sm font-medium text-slate-600">
          <span>
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </span>
          {quiz.time_limit_seconds && (
            <span className="flex items-center gap-1 text-amber-600">
              <Timer size={14} /> {Math.round(quiz.time_limit_seconds / 60)} min limit
            </span>
          )}
        </p>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          disabled={!name.trim()}
          onClick={() => {
            setTimeLeft(quiz.time_limit_seconds ?? 0);
            setStage("playing");
          }}
          className="mt-4 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Start Quiz
        </button>
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
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <Trophy className="mx-auto text-amber-500" size={40} />
        <h2 className="mt-3 text-2xl font-extrabold">
          {score} / {questions.length}
        </h2>
        <p className="mt-1 text-slate-500">
          {name}, you scored {pct}%{timedOut ? " — time ran out!" : ""}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Trophy size={16} className="text-amber-500" /> Leaderboard
        </h3>
        <ol className="mt-4 space-y-2">
          {leaderboard.map((a, i) => (
            <li
              key={a.id + i}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2 text-sm"
            >
              <span className="font-medium text-slate-700">
                {i + 1}. {a.name}
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
