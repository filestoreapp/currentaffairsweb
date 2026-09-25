"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createQuiz, updateQuiz, type QuizQuestionInput } from "@/lib/actions/quizzes";
import QuizExcelImport from "./QuizExcelImport";
import type { Category, Post, Quiz, QuizDifficulty, QuizStatus } from "@/lib/types";
import { Loader2, Plus, Trash2 } from "lucide-react";

function emptyQuestion(): QuizQuestionInput {
  return { question: "", options: ["", "", "", ""], correct_index: 0, explanation: "" };
}

const DIFFICULTIES: { value: QuizDifficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function QuizForm({
  quiz,
  posts,
  categories,
}: {
  quiz?: Quiz;
  posts: Post[];
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(quiz?.title ?? "");
  const [slug, setSlug] = useState(quiz?.slug ?? "");
  const [description, setDescription] = useState(quiz?.description ?? "");
  const [postId, setPostId] = useState(quiz?.post_id ?? "");
  const [categoryId, setCategoryId] = useState(quiz?.category_id ?? "");
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(
    quiz?.difficulty ?? "medium"
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    quiz?.time_limit_seconds ? String(Math.round(quiz.time_limit_seconds / 60)) : ""
  );
  const [isMock, setIsMock] = useState(quiz?.is_mock ?? false);
  const [isPyq, setIsPyq] = useState(quiz?.is_pyq ?? false);
  const [examName, setExamName] = useState(quiz?.exam_name ?? "");
  const [examYear, setExamYear] = useState(
    quiz?.exam_year ? String(quiz.exam_year) : ""
  );
  const [negativeMarking, setNegativeMarking] = useState(
    quiz?.negative_marking ? String(quiz.negative_marking) : "0"
  );
  const [instructions, setInstructions] = useState(quiz?.instructions ?? "");
  const [status, setStatus] = useState<QuizStatus>(quiz?.status ?? "draft");
  const [questions, setQuestions] = useState<QuizQuestionInput[]>(
    quiz?.questions && quiz.questions.length > 0
      ? quiz.questions.map((q) => ({
          question: q.question,
          options: q.options,
          correct_index: q.correct_index,
          explanation: q.explanation ?? "",
        }))
      : [emptyQuestion()]
  );
  const [error, setError] = useState<string | null>(null);

  function updateQuestion(i: number, patch: Partial<QuizQuestionInput>) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }

  function updateOption(qi: number, oi: number, value: string) {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi
          ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) }
          : q
      )
    );
  }

  function handleExcelImport(imported: QuizQuestionInput[]) {
    setQuestions((qs) => {
      const isPlaceholder =
        qs.length === 1 &&
        !qs[0].question.trim() &&
        qs[0].options.every((o) => !o.trim());
      return isPlaceholder ? imported : [...qs, ...imported];
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Title is required");
    for (const q of questions) {
      if (!q.question.trim() || q.options.some((o) => !o.trim())) {
        setError("Every question needs text and all 4 options filled in");
        return;
      }
    }

    const input = {
      title,
      slug: slug || undefined,
      description,
      post_id: postId || null,
      category_id: categoryId || null,
      difficulty,
      time_limit_seconds: timeLimitMinutes ? Number(timeLimitMinutes) * 60 : null,
      is_mock: isMock && !isPyq,
      negative_marking: isMock || isPyq ? Number(negativeMarking) : 0,
      instructions: isMock || isPyq ? instructions : "",
      is_pyq: isPyq && !isMock,
      exam_name: isPyq ? examName : "",
      exam_year: isPyq && examYear ? Number(examYear) : null,
      status,
      questions,
    };

    startTransition(async () => {
      try {
        if (quiz) {
          await updateQuiz(quiz.id, input);
        } else {
          await createQuiz(input);
        }
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. September 2026 Current Affairs Quiz"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Slug — leave blank to auto-generate
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <label className="text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as QuizStatus)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Category (optional)
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Time limit — minutes (optional)
            </label>
            <input
              type="number"
              min={1}
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(e.target.value)}
              placeholder="Untimed"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              Leave blank for no time limit. The clock runs for the whole
              quiz, not per question.
            </p>

            <label className="mt-4 flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={isMock}
                onChange={(e) => {
                  setIsMock(e.target.checked);
                  if (e.target.checked) setIsPyq(false);
                }}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-slate-700">
                  Mock test mode
                </span>
                <span className="block text-xs text-slate-400">
                  Exam-style runner: question palette, countdown, negative
                  marking, per-question review and a ranked leaderboard.
                </span>
              </span>
            </label>

            <label className="mt-4 flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={isPyq}
                onChange={(e) => {
                  setIsPyq(e.target.checked);
                  if (e.target.checked) setIsMock(false);
                }}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-slate-700">
                  PYQ paper mode
                </span>
                <span className="block text-xs text-slate-400">
                  Previous-year Kerala PSC paper, played in the same
                  exam-style runner and listed under PYQ Papers.
                </span>
              </span>
            </label>

            {isPyq && (
              <>
                <label className="mt-4 block text-sm font-medium text-slate-700">
                  Exam name
                </label>
                <input
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g. LDC, Secretariat Assistant, SI"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />

                <label className="mt-4 block text-sm font-medium text-slate-700">
                  Exam year
                </label>
                <input
                  type="number"
                  min={1990}
                  max={2100}
                  value={examYear}
                  onChange={(e) => setExamYear(e.target.value)}
                  placeholder="e.g. 2024"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </>
            )}

            {(isMock || isPyq) && (
              <>
                <label className="mt-4 block text-sm font-medium text-slate-700">
                  Negative marking
                </label>
                <select
                  value={negativeMarking}
                  onChange={(e) => setNegativeMarking(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="0">None (+1 / 0)</option>
                  <option value="0.25">−1/4 (−0.25 per wrong answer)</option>
                  <option value="0.33">−1/3 (−0.33 per wrong answer)</option>
                  <option value="0.5">−1/2 (−0.5 per wrong answer)</option>
                </select>

                <label className="mt-4 block text-sm font-medium text-slate-700">
                  Instructions shown before the test
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                  placeholder="e.g. 100 questions · 75 minutes · +1 for correct, −1/3 for wrong. Read each question carefully."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </>
            )}

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Attach to a post (optional)
            </label>
            <select
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Standalone quiz (not linked)</option>
              {posts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={isPending}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {quiz ? "Update Quiz" : "Create Quiz"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/quizzes")}
              className="mt-2 w-full rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Questions</h3>
          <div className="flex items-center gap-2">
            <QuizExcelImport onImport={handleExcelImport} />
            <button
              type="button"
              onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Plus size={14} /> Add question
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div
              key={qi}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="mt-2 text-xs font-bold text-slate-400">
                  Q{qi + 1}
                </span>
                <input
                  value={q.question}
                  onChange={(e) => updateQuestion(qi, { question: e.target.value })}
                  placeholder="Question text"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setQuestions((qs) => qs.filter((_, idx) => idx !== qi))
                    }
                    className="mt-1 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 pl-8 sm:grid-cols-2">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      q.correct_index === oi
                        ? "border-green-500 bg-green-50"
                        : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correct_index === oi}
                      onChange={() => updateQuestion(qi, { correct_index: oi })}
                    />
                    <input
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      placeholder={`Option ${oi + 1}`}
                      className="flex-1 bg-transparent focus:outline-none"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-3 pl-8">
                <input
                  value={q.explanation}
                  onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
                  placeholder="Explanation shown after answering (optional)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
