"use client";

import { useState } from "react";
import {
  createPscCategory,
  updatePscCategory,
  type PscCategoryFormInput,
} from "@/lib/actions/psc-categories";
import type { PaperSection } from "@/lib/types";
import PaperSectionsEditor from "./PaperSectionsEditor";

export interface PscCategoryEditable {
  id: string;
  cat_no: string;
  post_name: string;
  department: string | null;
  announcement_type: string | null;
  list_no: string | null;
  list_date: string | null;
  exam_date: string | null;
  details: string | null;
  source_url: string | null;
  paper_sections: PaperSection[];
  is_published: boolean;
}

const inputCls =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none";

export default function PscCategoryForm({ initial }: { initial?: PscCategoryEditable }) {
  const [catNo, setCatNo] = useState(initial?.cat_no ?? "");
  const [postName, setPostName] = useState(initial?.post_name ?? "");
  const [department, setDepartment] = useState(initial?.department ?? "");
  const [announcementType, setAnnouncementType] = useState(
    initial?.announcement_type ?? ""
  );
  const [listNo, setListNo] = useState(initial?.list_no ?? "");
  const [listDate, setListDate] = useState(initial?.list_date ?? "");
  const [examDate, setExamDate] = useState(initial?.exam_date ?? "");
  const [details, setDetails] = useState(initial?.details ?? "");
  const [sourceUrl, setSourceUrl] = useState(initial?.source_url ?? "");
  const [sections, setSections] = useState<PaperSection[]>(
    initial?.paper_sections ?? []
  );
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!catNo.trim() || !postName.trim()) {
      setError("Category number and post name are required.");
      return;
    }
    setSaving(true);
    const input: PscCategoryFormInput = {
      cat_no: catNo,
      post_name: postName,
      department,
      announcement_type: announcementType,
      list_no: listNo,
      list_date: listDate || null,
      exam_date: examDate || null,
      details,
      source_url: sourceUrl,
      paper_sections: sections,
      is_published: isPublished,
    };
    try {
      if (initial) await updatePscCategory(initial.id, input);
      else await createPscCategory(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setSaving(false);
    }
  }

  const slugForKey =
    catNo.trim().replace(/\//g, "-").replace(/[^a-z0-9-]/gi, "-").toLowerCase() || "paper";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Category number *
          </label>
          <input
            value={catNo}
            onChange={(e) => setCatNo(e.target.value)}
            placeholder="e.g. 427/2024"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Announcement type
          </label>
          <input
            value={announcementType}
            onChange={(e) => setAnnouncementType(e.target.value)}
            placeholder="Ranked List, Short Lists, Latest…"
            list="announcement-types"
            className={inputCls}
          />
          <datalist id="announcement-types">
            <option value="Ranked List" />
            <option value="Short Lists" />
            <option value="Latest" />
            <option value="Addendum/Erratum" />
          </datalist>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Post name *
        </label>
        <input
          value={postName}
          onChange={(e) => setPostName(e.target.value)}
          placeholder="e.g. Police Constable Driver, Kerala Police"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Department
        </label>
        <input
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className={inputCls}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            List number
          </label>
          <input
            value={listNo}
            onChange={(e) => setListNo(e.target.value)}
            placeholder="e.g. 679/2026/ROE"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            List date
          </label>
          <input
            type="date"
            value={listDate}
            onChange={(e) => setListDate(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Exam date (countdown)
          </label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Details
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Source URL (official PDF)
        </label>
        <input
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://…"
          className={inputCls}
        />
      </div>

      <PaperSectionsEditor
        sections={sections}
        onChange={setSections}
        slugForKey={`cat-${slugForKey}`}
        error={error}
        setError={setError}
      />

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
        />
        Published (visible on the site)
      </label>

      {error && (
        <p className="text-sm font-medium text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? "Saving…" : initial ? "Save changes" : "Create category page"}
      </button>
    </form>
  );
}
