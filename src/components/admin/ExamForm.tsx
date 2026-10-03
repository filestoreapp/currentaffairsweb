"use client";

import { useState } from "react";
import {
  createExam,
  updateExam,
  getExamDocUploadUrl,
} from "@/lib/actions/exams";
import { Loader2 } from "lucide-react";
import type { Exam, ExamSyllabusSection } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
const labelCls =
  "mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500";

const SYLLABUS_PLACEHOLDER = `[
  { "section": "General Knowledge & Current Affairs", "topics": ["Kerala history", "Indian polity"] },
  { "section": "Reasoning & Mental Ability", "topics": ["Analogies", "Series"] }
]`;

function Field({
  label,
  children,
  span = false,
}: {
  label: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}
function PdfUploadField({
  label,
  hint,
  docKey,
  onRemove,
  kind,
  uploading,
  onSelect,
}: {
  label: string;
  hint: string;
  docKey: string;
  onRemove: () => void;
  kind: "notification" | "paper";
  uploading: boolean;
  onSelect: (kind: "notification" | "paper", file: File) => void;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
      {docKey ? (
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <span className="truncate text-sm font-medium text-emerald-700">
            {docKey.split("/").pop()}
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="ml-auto shrink-0 text-xs font-medium text-slate-500 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      ) : (
        <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600">
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSelect(kind, file);
              e.target.value = "";
            }}
          />
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </>
          ) : (
            <>Choose PDF</>
          )}
        </label>
      )}
    </div>
  );
}

export default function ExamForm({ exam }: { exam?: Exam | null }) {
  const [name, setName] = useState(exam?.name ?? "");
  const [shortName, setShortName] = useState(exam?.short_name ?? "");
  const [slug, setSlug] = useState(exam?.slug ?? "");
  const [department, setDepartment] = useState(exam?.department ?? "");
  const [categoryNo, setCategoryNo] = useState(exam?.category_no ?? "");
  const [questionPaperCode, setQuestionPaperCode] = useState(
    exam?.question_paper_code ?? ""
  );
  const [notificationPdfKey, setNotificationPdfKey] = useState(
    exam?.notification_pdf_key ?? ""
  );
  const [questionPaperPdfKey, setQuestionPaperPdfKey] = useState(
    exam?.question_paper_pdf_key ?? ""
  );
  const [uploadingKind, setUploadingKind] = useState<
    "notification" | "paper" | null
  >(null);

  async function handleDocSelect(
    kind: "notification" | "paper",
    file: File
  ) {
    setError("");
    if (!/\.pdf$/i.test(file.name) || file.type !== "application/pdf") {
      setError("Please choose a PDF file.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("PDF must be under 50 MB.");
      return;
    }
    const slugForKey =
      slug.trim() ||
      name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) ||
      "exam";
    setUploadingKind(kind);
    try {
      const { uploadUrl, key } = await getExamDocUploadUrl(
        slugForKey,
        kind,
        file.name,
        file.size
      );
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: file,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      if (kind === "notification") setNotificationPdfKey(key);
      else setQuestionPaperPdfKey(key);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "PDF upload failed. Try again."
      );
    } finally {
      setUploadingKind(null);
    }
  }
  const [qualification, setQualification] = useState(exam?.qualification ?? "");
  const [ageLimit, setAgeLimit] = useState(exam?.age_limit ?? "");
  const [payScale, setPayScale] = useState(exam?.pay_scale ?? "");
  const [vacancy, setVacancy] = useState(exam?.vacancy ?? "");
  const [notificationDate, setNotificationDate] = useState(
    exam?.notification_date ?? ""
  );
  const [admitCardDate, setAdmitCardDate] = useState(
    exam?.admit_card_date ?? ""
  );
  const [examDate, setExamDate] = useState(exam?.exam_date ?? "");
  const [resultDate, setResultDate] = useState(exam?.result_date ?? "");
  const [status, setStatus] = useState(exam?.status ?? "upcoming");
  const [description, setDescription] = useState(exam?.description ?? "");
  const [syllabusJson, setSyllabusJson] = useState(
    exam ? JSON.stringify(exam.syllabus, null, 2) : "[]"
  );
  const [isPublished, setIsPublished] = useState(exam?.is_published ?? true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !shortName.trim()) {
      setError("Name and short name are required.");
      return;
    }
    let syllabus: ExamSyllabusSection[];
    try {
      const parsed = JSON.parse(syllabusJson.trim() || "[]");
      if (!Array.isArray(parsed)) throw new Error("not an array");
      syllabus = parsed.map((s) => ({
        section: String(s.section ?? ""),
        topics: Array.isArray(s.topics)
          ? s.topics.map((t: unknown) => String(t))
          : [],
      }));
    } catch {
      setError("Syllabus must be valid JSON — an array of {section, topics}.");
      return;
    }
    setSaving(true);
    try {
      const input = {
        name,
        short_name: shortName,
        slug: slug || undefined,
        department,
        category_no: categoryNo,
        question_paper_code: questionPaperCode,
        notification_pdf_key: notificationPdfKey,
        question_paper_pdf_key: questionPaperPdfKey,
        qualification,
        age_limit: ageLimit,
        pay_scale: payScale,
        vacancy,
        notification_date: notificationDate,
        admit_card_date: admitCardDate,
        exam_date: examDate,
        result_date: resultDate,
        status: status as "upcoming" | "ongoing" | "completed",
        description,
        syllabus,
        is_published: isPublished,
      };
      if (exam) await updateExam(exam.id, input);
      else await createExam(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Exam name *">
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Lower Division Clerk"
          />
        </Field>
        <Field label="Short name *">
          <input
            className={inputCls}
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            placeholder="LDC"
          />
        </Field>
        <Field label="Slug (auto from name if blank)">
          <input
            className={inputCls}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ldc"
          />
        </Field>
        <Field label="Department">
          <input
            className={inputCls}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Various Government Departments"
          />
        </Field>
        <Field label="Category number">
          <input
            className={inputCls}
            value={categoryNo}
            onChange={(e) => setCategoryNo(e.target.value)}
            placeholder="611/2024 — auto-links PSC notifications"
          />
        </Field>
        <Field label="Question paper code">
          <input
            className={inputCls}
            value={questionPaperCode}
            onChange={(e) => setQuestionPaperCode(e.target.value)}
            placeholder="87/2026 — assigned by PSC when the exam is scheduled"
          />
        </Field>
        <PdfUploadField
          label="Notification PDF"
          hint="Official PSC notification PDF — shown as a download on the hub."
          docKey={notificationPdfKey}
          onRemove={() => setNotificationPdfKey("")}
          kind="notification"
          uploading={uploadingKind === "notification"}
          onSelect={handleDocSelect}
        />
        <PdfUploadField
          label="Question paper PDF"
          hint="The exam’s question paper — shown as a download on the hub."
          docKey={questionPaperPdfKey}
          onRemove={() => setQuestionPaperPdfKey("")}
          kind="paper"
          uploading={uploadingKind === "paper"}
          onSelect={handleDocSelect}
        />
        <Field label="Status">
          <select
            className={inputCls}
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "upcoming" | "ongoing" | "completed")
            }
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </Field>
        <Field label="Qualification">
          <input
            className={inputCls}
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            placeholder="SSLC (10th standard)"
          />
        </Field>
        <Field label="Age limit">
          <input
            className={inputCls}
            value={ageLimit}
            onChange={(e) => setAgeLimit(e.target.value)}
            placeholder="18–36 years"
          />
        </Field>
        <Field label="Pay scale">
          <input
            className={inputCls}
            value={payScale}
            onChange={(e) => setPayScale(e.target.value)}
            placeholder="₹26,500 – ₹60,700"
          />
        </Field>
        <Field label="Vacancy">
          <input
            className={inputCls}
            value={vacancy}
            onChange={(e) => setVacancy(e.target.value)}
            placeholder="Anticipated"
          />
        </Field>
      </div>

      <div>
        <label className={labelCls}>Important dates</label>
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            ["Notification", notificationDate, setNotificationDate],
            ["Admit card", admitCardDate, setAdmitCardDate],
            ["Exam date", examDate, setExamDate],
            ["Result", resultDate, setResultDate],
          ].map(([lbl, val, set]) => (
            <div key={lbl as string}>
              <label className="mb-1 block text-xs text-slate-500">
                {lbl as string}
              </label>
              <input
                type="date"
                className={inputCls}
                value={val as string}
                onChange={(e) =>
                  (set as React.Dispatch<React.SetStateAction<string>>)(
                    e.target.value
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>

      <Field label="Description" span>
        <textarea
          className={`${inputCls} min-h-24`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="2–3 sentences about the exam (English)."
        />
      </Field>

      <Field label="Syllabus (JSON — array of {section, topics})" span>
        <textarea
          className={`${inputCls} min-h-40 font-mono text-xs`}
          value={syllabusJson}
          onChange={(e) => setSyllabusJson(e.target.value)}
          placeholder={SYLLABUS_PLACEHOLDER}
          spellCheck={false}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
        />
        Published (visible on the site)
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : exam ? "Save changes" : "Create exam"}
        </button>
      </div>
    </form>
  );
}
