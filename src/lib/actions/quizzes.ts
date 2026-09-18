"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import type { QuizDifficulty, QuizStatus } from "@/lib/types";

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
  status: QuizStatus;
  questions: QuizQuestionInput[];
}

export async function createQuiz(input: QuizFormInput) {
  const supabase = await createClient();
  const slug = input.slug
    ? slugify(input.slug, { lower: true, strict: true })
    : slugify(input.title, { lower: true, strict: true }).slice(0, 90);

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
  redirect("/admin/quizzes");
}

export async function updateQuiz(id: string, input: QuizFormInput) {
  const supabase = await createClient();
  const slug = input.slug
    ? slugify(input.slug, { lower: true, strict: true })
    : slugify(input.title, { lower: true, strict: true }).slice(0, 90);

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
  revalidatePath(`/quiz/${slug}`);
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
