import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ExamForm from "@/components/admin/ExamForm";

export default function NewExamPage() {
  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/exams"
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-indigo-600"
      >
        <ChevronLeft size={15} /> Back to Exams
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">New Exam</h1>
      <p className="mt-1 text-sm text-slate-500">
        Creates a public exam hub at /exams/&lt;slug&gt; with syllabus, dates,
        and linked mocks, PYQs and notifications.
      </p>
      <ExamForm />
    </div>
  );
}
