"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import type { QuizDifficulty, QuizStatus } from "@/lib/types";
import { postMockToTelegram, postPyqToTelegram } from "@/lib/telegram";
import { createPyqUploadUrl, isR2Configured } from "@/lib/r2";

export interface QuizQuestionInput {
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

export interface QuizFormInput {
  title: string;
  slug?: string;
  description?: string;
  post_id?: string | null;
  category_id?: string | null;
  difficulty: QuizDifficulty;
  time_limit_seconds?: number | null;
  is_mock: boolean;
  negative_marking: number;
  instructions?: string;
  is_pyq: boolean;
  exam_name?: string;
  exam_year?: number | null;
  pdf_url?: string | null;
  status: QuizStatus;
  questions: QuizQuestionInput[];
}

export async function createQuiz(input: QuizFormInput) {
  const supabase = await createClient();
  const slug = input.slug
    ? slugify(input.slug, { lower: true, strict: true })
    : slugify(input.title, { lower: true, strict: true }).slice(0, 90);

  // A quiz is either a regular quiz, a mock test, or a PYQ paper — never two at once.
  const isPyq = input.is_pyq && !input.is_mock;

  const { data: quiz, error } = await supabase
    .from("quizzes")
    .insert({
      title: input.title,
      slug,
      description: input.description || null,
      post_id: input.post_id || null,
      category_id: input.category_id || null,
      difficulty: input.difficulty,
      time_limit_seconds: input.time_limit_seconds || null,
      is_mock: input.is_mock && !isPyq,
      negative_marking: input.negative_marking || 0,
      instructions: input.instructions || null,
      is_pyq: isPyq,
      exam_name: isPyq ? input.exam_name || null : null,
      exam_year: isPyq ? input.exam_year || null : null,
      pdf_url: isPyq ? input.pdf_url || null : null,
      status: input.status,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (input.questions.length > 0) {
    const { error: qError } = await supabase.from("quiz_questions").insert(
      input.questions.map((q, i) => ({
        quiz_id: quiz.id,
        question: q.question,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation || null,
        position: i,
      }))
    );
    if (qError) throw new Error(qError.message);
  }

  revalidatePath("/admin/quizzes");
  revalidatePath("/quiz");
  revalidatePath("/mock-tests");
  revalidatePath("/pyqs");

  // Announce newly published mock tests on Telegram so followers know
  // a fresh full-length test is available.
  if (input.is_mock && !isPyq && input.status === "published") {
    await postMockToTelegram({
      title: quiz.title,
      slug: quiz.slug,
      description: quiz.description,
      questionCount: input.questions.length,
      durationMinutes: input.time_limit_seconds
        ? Math.round(input.time_limit_seconds / 60)
        : null,
      negativeMarking: input.negative_marking || 0,
    });
  }

  // Announce newly published PYQ papers the same way.
  if (isPyq && input.status === "published") {
    await postPyqToTelegram({
      title: quiz.title,
      slug: quiz.slug,
      description: quiz.description,
      examName: input.exam_name || null,
      examYear: input.exam_year || null,
      pdfUrl: input.pdf_url || null,
      questionCount: input.questions.length,
      negativeMarking: input.negative_marking || 0,
    });
  }

  redirect("/admin/quizzes");
}

export async function updateQuiz(id: string, input: QuizFormInput) {
  const supabase = await createClient();
  const slug = input.slug
    ? slugify(input.slug, { lower: true, strict: true })
    : slugify(input.title, { lower: true, strict: true }).slice(0, 90);

  const { data: previous } = await supabase
    .from("quizzes")
    .select("status")
    .eq("id", id)
    .single();

  // A quiz is either a regular quiz, a mock test, or a PYQ paper — never two at once.
  const isPyq = input.is_pyq && !input.is_mock;

  const { error } = await supabase
    .from("quizzes")
    .update({
      title: input.title,
      slug,
      description: input.description || null,
      post_id: input.post_id || null,
      category_id: input.category_id || null,
      difficulty: input.difficulty,
      time_limit_seconds: input.time_limit_seconds || null,
      is_mock: input.is_mock && !isPyq,
      negative_marking: input.negative_marking || 0,
      instructions: input.instructions || null,
      is_pyq: isPyq,
      exam_name: isPyq ? input.exam_name || null : null,
      exam_year: isPyq ? input.exam_year || null : null,
      pdf_url: isPyq ? input.pdf_url || null : null,
      status: input.status,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Simplest correct way to handle edits: replace all questions.
  await supabase.from("quiz_questions").delete().eq("quiz_id", id);

  if (input.questions.length > 0) {
    const { error: qError } = await supabase.from("quiz_questions").insert(
      input.questions.map((q, i) => ({
        quiz_id: id,
        question: q.question,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation || null,
        position: i,
      }))
    );
    if (qError) throw new Error(qError.message);
  }

  revalidatePath("/admin/quizzes");
  revalidatePath("/quiz");
  revalidatePath("/mock-tests");
  revalidatePath("/pyqs");
  revalidatePath(`/quiz/${slug}`);
  revalidatePath(`/mock-tests/${slug}`);
  revalidatePath(`/pyqs/${slug}`);

  // Announce when a mock test is published for the first time (draft -> published).
  if (
    input.is_mock &&
    !isPyq &&
    input.status === "published" &&
    previous?.status !== "published"
  ) {
    await postMockToTelegram({
      title: input.title,
      slug,
      description: input.description || null,
      questionCount: input.questions.length,
      durationMinutes: input.time_limit_seconds
        ? Math.round(input.time_limit_seconds / 60)
        : null,
      negativeMarking: input.negative_marking || 0,
    });
  }

  // Announce when a PYQ paper is published for the first time (draft -> published).
  if (
    isPyq &&
    input.status === "published" &&
    previous?.status !== "published"
  ) {
    await postPyqToTelegram({
      title: input.title,
      slug,
      description: input.description || null,
      examName: input.exam_name || null,
      examYear: input.exam_year || null,
      pdfUrl: input.pdf_url || null,
      questionCount: input.questions.length,
      negativeMarking: input.negative_marking || 0,
    });
  }

  redirect("/admin/quizzes");
}

export async function deleteQuiz(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("quizzes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/quizzes");
  revalidatePath("/quiz");
}

export async function submitQuizAttempt(
  quizId: string,
  name: string,
  score: number,
  total: number
) {
  const supabase = await createClient();
  const { error } = await supabase.from("quiz_attempts").insert({
    quiz_id: quizId,
    name: name.slice(0, 60),
    score,
    total,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/quiz`);
}

export interface MockAttemptInput {
  quizId: string;
  name: string;
  answers: (number | null)[];
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  score: number;
  total: number;
  timeTakenSeconds: number;
}

/** Detailed attempt for a mock test: per-question answers + exam stats. */
export async function submitMockAttempt(input: MockAttemptInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("quiz_attempts").insert({
    quiz_id: input.quizId,
    name: input.name.slice(0, 60),
    answers: input.answers,
    correct_count: input.correctCount,
    wrong_count: input.wrongCount,
    skipped_count: input.skippedCount,
    score: input.score,
    total: input.total,
    time_taken_seconds: input.timeTakenSeconds,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/mock-tests`);
}

/**
 * Mint a presigned R2 upload URL for a PYQ paper PDF. The admin's browser
 * PUTs the file straight to R2, so large PDFs never pass through Vercel's
 * request-body limit. Auth-gated: only logged-in admins can mint URLs.
 */
export async function getPyqPdfUploadUrl(
  quizSlug: string,
  filename: string,
  sizeBytes: number
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to upload files.");
  if (!isR2Configured()) {
    throw new Error("R2 storage is not configured. Add the R2 env vars first.");
  }
  if (!/\.pdf$/i.test(filename)) {
    throw new Error("Only PDF files can be uploaded.");
  }
  const grant = await createPyqUploadUrl(quizSlug, filename, sizeBytes);
  return { uploadUrl: grant.uploadUrl, publicUrl: grant.publicUrl };
}
