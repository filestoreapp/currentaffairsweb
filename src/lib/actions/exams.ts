"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import type { ExamSyllabusSection } from "@/lib/types";

export interface ExamFormInput {
  name: string;
  short_name: string;
  slug?: string;
  department?: string | null;
  category_no?: string | null;
  qualification?: string | null;
  age_limit?: string | null;
  pay_scale?: string | null;
  vacancy?: string | null;
  notification_date?: string | null;
  admit_card_date?: string | null;
  exam_date?: string | null;
  result_date?: string | null;
  status: "upcoming" | "ongoing" | "completed";
  description?: string | null;
  syllabus: ExamSyllabusSection[];
  is_published: boolean;
}

function toRow(input: ExamFormInput) {
  const emptyToNull = (v?: string | null) =>
    v && v.trim() ? v.trim() : null;
  return {
    name: input.name.trim(),
    short_name: input.short_name.trim(),
    department: emptyToNull(input.department),
    category_no: emptyToNull(input.category_no),
    qualification: emptyToNull(input.qualification),
    age_limit: emptyToNull(input.age_limit),
    pay_scale: emptyToNull(input.pay_scale),
    vacancy: emptyToNull(input.vacancy),
    notification_date: emptyToNull(input.notification_date),
    admit_card_date: emptyToNull(input.admit_card_date),
    exam_date: emptyToNull(input.exam_date),
    result_date: emptyToNull(input.result_date),
    status: input.status,
    description: emptyToNull(input.description),
    syllabus: input.syllabus,
    is_published: input.is_published,
  };
}

function revalidateExams(slug?: string) {
  revalidatePath("/exams");
  revalidatePath("/admin/exams");
  if (slug) revalidatePath(`/exams/${slug}`);
}

export async function createExam(input: ExamFormInput) {
  const supabase = await createClient();
  const slug = input.slug
    ? slugify(input.slug, { lower: true, strict: true })
    : slugify(input.name, { lower: true, strict: true }).slice(0, 60);

  const { error } = await supabase
    .from("exams")
    .insert({ ...toRow(input), slug });
  if (error) throw new Error(error.message);

  revalidateExams(slug);
  redirect("/admin/exams");
}

export async function updateExam(id: string, input: ExamFormInput) {
  const supabase = await createClient();
  const slug = input.slug
    ? slugify(input.slug, { lower: true, strict: true })
    : undefined;

  const { error } = await supabase
    .from("exams")
    .update({ ...toRow(input), ...(slug ? { slug } : {}) })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateExams(slug);
  redirect("/admin/exams");
}

export async function deleteExam(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("exams").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateExams();
}
