"use client";

import { useState } from "react";
import { submitQuizAttempt } from "@/lib/actions/quizzes";
import type { Quiz, QuizAttempt } from "@/lib/types";
import { CheckCircle2, XCircle, Loader2, Trophy } from "lucide-react";

type Stage = "intro" | "playing" | "result";

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
  const [submitting, setSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);

  const question = questions[current];

  function selectOption(index: number) {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    if (index === question.correct_index) {
      setScore((s) => s + 1);
    }
  }

  async function nextQuestion() {
    setSelected(null);
    setAnswered(false);
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
    } else {
      setSubmitting(true);
      try {
        await submitQuizAttempt(quiz.id, name, score, questions.length);
        setLeaderboard(
          [...leaderboard, { id: "temp", quiz_id: quiz.id, name, score, total: questions.length, created_at: new Date().toISOString() }]
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
        <p className="mt-4 text-sm font-medium text-slate-600">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </p>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          disabled={!name.trim()}
          onClick={() => setStage("playing")}
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
          <span>Score: {score}</span>
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
          {name}, you scored {pct}%
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
