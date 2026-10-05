"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { getPyqPdfUploadUrl } from "@/lib/actions/quizzes";
import type { PaperSection } from "@/lib/types";

/**
 * Standalone editor for question-paper / answer-key sections.
 * Controlled: sections + onChange. slugForKey is used as the B2 key prefix.
 */
export default function PaperSectionsEditor({
  sections,
  onChange,
  slugForKey,
  error,
  setError,
}: {
  sections: PaperSection[];
  onChange: (s: PaperSection[]) => void;
  slugForKey: string;
  error: string | null;
  setError: (e: string | null) => void;
}) {
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  function addSection() {
    onChange([
      ...sections,
      {
        label: `Section ${String.fromCharCode(65 + sections.length)}`,
        question_key: null,
        answer_key: null,
      },
    ]);
  }

  async function handlePdfSelect(
    si: number,
    kind: "question_key" | "answer_key",
    file: File
  ) {
    setError(null);
    if (!/\.pdf$/i.test(file.name) || file.type !== "application/pdf") {
      setError("Please choose a PDF file.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("PDF must be under 50 MB.");
      return;
    }
    setUploadingSlot(`${si}:${kind}`);
    try {
      const { uploadUrl, key } = await getPyqPdfUploadUrl(slugForKey, file.name, file.size);
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: file,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      onChange(sections.map((s, i) => (i === si ? { ...s, [kind]: key } : s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF upload failed. Try again.");
    } finally {
      setUploadingSlot(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          Paper sections
        </label>
        <button
          type="button"
          onClick={addSection}
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
        >
          <Plus size={13} /> Add section
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        e.g. Section A, Section B — each with its question paper and answer
        key PDFs (max 50 MB each).
      </p>
      {sections.length === 0 && (
        <p className="mt-2 rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-400">
          No sections yet — click “Add section” to upload question papers and
          answer keys.
        </p>
      )}
      <div className="mt-2 space-y-3">
        {sections.map((s, si) => (
          <div key={si} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center gap-2">
              <input
                value={s.label}
                onChange={(e) =>
                  onChange(
                    sections.map((x, i) =>
                      i === si ? { ...x, label: e.target.value } : x
                    )
                  )
                }
                placeholder="Section A"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onChange(sections.filter((_, i) => i !== si))}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                title="Remove section"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(
                [
                  { kind: "question_key", label: "Question paper" },
                  { kind: "answer_key", label: "Answer key" },
                ] as const
              ).map(({ kind, label }) => {
                const key = s[kind];
                const busy = uploadingSlot === `${si}:${kind}`;
                return (
                  <div key={kind}>
                    <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
                    {key ? (
                      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5">
                        <span className="truncate text-xs font-medium text-emerald-700">
                          {key.split("/").pop()}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onChange(
                              sections.map((x, i) =>
                                i === si ? { ...x, [kind]: null } : x
                              )
                            )
                          }
                          className="ml-auto shrink-0 text-xs font-medium text-slate-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-3 py-3 text-xs text-slate-500 hover:border-indigo-400 hover:text-indigo-600">
                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          className="sr-only"
                          disabled={busy}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePdfSelect(si, kind, file);
                            e.target.value = "";
                          }}
                        />
                        {busy ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Uploading…
                          </>
                        ) : (
                          <>Choose PDF</>
                        )}
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
