"use client";

import { useRef, useState } from "react";
import { Download, FileUp, Loader2 } from "lucide-react";
import type { QuizQuestionInput } from "@/lib/actions/quizzes";

type SkippedRow = { row: number; reason: string };

const HEADER_ALIASES: Record<
  string,
  "question" | "a" | "b" | "c" | "d" | "correct" | "explanation"
> = {
  question: "question",
  "option a": "a",
  a: "a",
  "option b": "b",
  b: "b",
  "option c": "c",
  c: "c",
  "option d": "d",
  d: "d",
  "correct answer": "correct",
  correct: "correct",
  answer: "correct",
  explanation: "explanation",
};

function norm(v: unknown): string {
  return String(v ?? "").trim();
}

function parseCorrect(raw: string, options: string[]): number | null {
  const v = raw.trim();
  if (/^[a-dA-D]$/.test(v)) return v.toUpperCase().charCodeAt(0) - 65;
  if (/^[1-4]$/.test(v)) return Number(v) - 1;
  const idx = options.findIndex(
    (o) => o.trim().toLowerCase() === v.toLowerCase()
  );
  return idx >= 0 ? idx : null;
}

async function parseFile(file: File): Promise<{
  imported: QuizQuestionInput[];
  skipped: SkippedRow[];
}> {
  const XLSX = await import("xlsx");
  const isCsv = /\.csv$/i.test(file.name);
  const data = isCsv ? await file.text() : await file.arrayBuffer();
  const wb = XLSX.read(data as string | ArrayBuffer, {
    type: isCsv ? "string" : "array",
  });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error("No worksheet found in the file");

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as unknown[][];
  const nonEmpty = rows.filter((r) => r.some((c) => norm(c) !== ""));
  if (nonEmpty.length === 0) throw new Error("The file has no data rows");

  // Detect a header row like: Question | Option A | Option B | ... | Correct Answer | Explanation
  const first = nonEmpty[0].map((c) => norm(c).toLowerCase());
  const hasHeader = first.some((c) => c in HEADER_ALIASES);
  let colIdx: Partial<Record<string, number>> | null = null;
  let dataRows = nonEmpty;
  if (hasHeader) {
    colIdx = {};
    first.forEach((c, i) => {
      const key = HEADER_ALIASES[c];
      if (key && colIdx![key] === undefined) colIdx![key] = i;
    });
    dataRows = nonEmpty.slice(1);
  }
  const get = (r: unknown[], name: string, pos: number): string =>
    colIdx && colIdx[name] !== undefined ? norm(r[colIdx[name]!]) : norm(r[pos]);

  const imported: QuizQuestionInput[] = [];
  const skipped: SkippedRow[] = [];
  dataRows.forEach((r, i) => {
    const rowNum = i + (hasHeader ? 2 : 1);
    const question = get(r, "question", 0);
    const options = [get(r, "a", 1), get(r, "b", 2), get(r, "c", 3), get(r, "d", 4)];
    const correctRaw = get(r, "correct", 5);
    const explanation = get(r, "explanation", 6);

    if (!question) {
      skipped.push({ row: rowNum, reason: "missing question text" });
      return;
    }
    const emptyOpt = options.findIndex((o) => !o);
    if (emptyOpt >= 0) {
      skipped.push({
        row: rowNum,
        reason: `Option ${"ABCD"[emptyOpt]} is empty (all 4 options required)`,
      });
      return;
    }
    const correct_index = parseCorrect(correctRaw, options);
    if (correct_index === null) {
      skipped.push({
        row: rowNum,
        reason: `Correct answer "${correctRaw || "—"}" not recognized — use A–D, 1–4, or the exact option text`,
      });
      return;
    }
    imported.push({ question, options, correct_index, explanation });
  });

  return { imported, skipped };
}

export default function QuizExcelImport({
  onImport,
}: {
  onImport: (questions: QuizQuestionInput[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    imported: QuizQuestionInput[];
    skipped: SkippedRow[];
    fileName: string;
  } | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setPreview(null);
    setParsing(true);
    try {
      const result = await parseFile(file);
      if (result.imported.length === 0) {
        setError(
          result.skipped.length > 0
            ? `No valid questions found. ${result.skipped.length} row(s) skipped — check the format against the template.`
            : "No valid questions found in the file."
        );
        return;
      }
      setPreview({ ...result, fileName: file.name });
    } catch (err) {
      setError((err as Error).message || "Could not read the file");
    } finally {
      setParsing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={parsing}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {parsing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <FileUp size={14} />
          )}
          {parsing ? "Reading…" : "Import Excel"}
        </button>
        <a
          href="/quiz-import-template.xlsx"
          download
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
        >
          <Download size={14} /> Template
        </a>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && (
        <p className="mt-2 max-w-md rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {preview && (
        <div className="mt-2 max-w-md rounded-xl border border-indigo-200 bg-indigo-50 p-3">
          <p className="text-xs font-semibold text-indigo-900">
            {preview.fileName}: {preview.imported.length} question
            {preview.imported.length === 1 ? "" : "s"} ready to add
            {preview.skipped.length > 0 &&
              `, ${preview.skipped.length} row${preview.skipped.length === 1 ? "" : "s"} skipped`}
          </p>
          {preview.skipped.length > 0 && (
            <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs text-indigo-800">
              {preview.skipped.map((s) => (
                <li key={s.row}>
                  <span className="font-semibold">Row {s.row}:</span> {s.reason}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onImport(preview.imported);
                setPreview(null);
              }}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Add {preview.imported.length} question
              {preview.imported.length === 1 ? "" : "s"}
            </button>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
