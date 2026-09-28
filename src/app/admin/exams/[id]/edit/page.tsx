import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getExamByIdForAdmin } from "@/lib/exams";
import ExamForm from "@/components/admin/ExamForm";

export default async function EditExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exam = await getExamByIdForAdmin(id);
  if (!exam) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/exams"
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-indigo-600"
      >
        <ChevronLeft size={15} /> Back to Exams
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
        Edit: {exam.name}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Live at{" "}
        <Link
          href={`/exams/${exam.slug}`}
          target="_blank"
          className="font-semibold text-indigo-600 hover:text-indigo-800"
        >
          /exams/{exam.slug}
        </Link>
      </p>
      <ExamForm exam={exam} />
    </div>
  );
}
