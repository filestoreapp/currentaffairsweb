"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PaperSection } from "@/lib/types";

export interface PscCategoryFormInput {
  cat_no: string;
  post_name: string;
  department?: string | null;
  announcement_type?: string | null;
  list_no?: string | null;
  list_date?: string | null;
  exam_date?: string | null;
  details?: string | null;
  source_url?: string | null;
  paper_sections: PaperSection[];
  is_published: boolean;
}

function catNoToSlug(catNo: string): string {
  return catNo.trim().replace(/\//g, "-").replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "cat";
}

function toRow(input: PscCategoryFormInput) {
  const emptyToNull = (v?: string | null) => (v && v.trim() ? v.trim() : null);
  return {
    cat_no: input.cat_no.trim(),
    slug: catNoToSlug(input.cat_no),
    post_name: input.post_name.trim(),
    department: emptyToNull(input.department),
    announcement_type: emptyToNull(input.announcement_type),
    list_no: emptyToNull(input.list_no),
    list_date: emptyToNull(input.list_date),
    exam_date: emptyToNull(input.exam_date),
    details: emptyToNull(input.details),
    source_url: emptyToNull(input.source_url),
    paper_sections: input.paper_sections ?? [],
    is_published: input.is_published,
  };
}

export async function createPscCategory(input: PscCategoryFormInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("psc_categories").insert(toRow(input));
  if (error) throw new Error(error.message);
  revalidatePath("/psc-categories");
  redirect("/admin/psc-categories");
}

export async function updatePscCategory(id: string, input: PscCategoryFormInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("psc_categories")
    .update(toRow(input))
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/psc-categories");
  revalidatePath(`/psc-categories/${catNoToSlug(input.cat_no)}`);
  redirect("/admin/psc-categories");
}

export async function deletePscCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("psc_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/psc-categories");
}

// ---- Import from keralapsc.gov.in/latest ----

interface LatestAnnouncement {
  type: string;
  title: string;
  details: string;
  url: string;
}

async function fetchLatestAnnouncements(): Promise<LatestAnnouncement[]> {
  const res = await fetch("https://www.keralapsc.gov.in/latest", {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`PSC site returned ${res.status}`);
  const html = await res.text();

  const stripTags = (s: string) =>
    s
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();

  const cell = (row: string, header: string) => {
    const m = row.match(
      new RegExp(`<td[^>]*headers="${header}"[^>]*>([\\s\\S]*?)</td>`)
    );
    return m ? m[1] : "";
  };

  const rows = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) ?? [];
  const items: LatestAnnouncement[] = [];
  for (const row of rows.slice(1)) {
    const type = stripTags(cell(row, "view-type-table-column"));
    const title = stripTags(cell(row, "view-title-table-column"));
    if (!type || !title) continue;
    const details = stripTags(cell(row, "view-body-table-column"));
    const link = cell(row, "view-field-file-table-column").match(/href="([^"]+)"/);
    let url = link ? link[1] : "";
    if (url && !url.startsWith("http")) url = "https://www.keralapsc.gov.in" + url;
    items.push({ type, title, details, url });
  }
  return items;
}

/** Import announcements from the PSC "Latest" page. Upserts by cat_no. Returns counts. */
export async function importPscCategoriesFromLatest(): Promise<{
  inserted: number;
  updated: number;
}> {
  const supabase = await createClient();
  const items = await fetchLatestAnnouncements();

  const parseDate = (s: string): string | null => {
    const m = s.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
    if (!m) return null;
    let [, d, mo, y] = m;
    if (y.length === 2) y = "20" + y;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  };

  let inserted = 0;
  let updated = 0;

  for (const item of items) {
    const cats = item.title.match(/\d{1,4}\/\d{4}/g) ?? [];
    const catNo = cats[0];
    if (!catNo) continue;

    const listNo =
      item.details.match(/(?:Ranked List|Short List|S\/L|SL)[^.]*?No\.?\s*:?\s*([A-Za-z0-9\-/.]+)/i)?.[1]?.replace(/[.,]+$/, "") ?? null;
    const listDate = parseDate(item.details);

    const row = {
      cat_no: catNo,
      slug: catNoToSlug(catNo),
      post_name: item.title.slice(0, 500),
      announcement_type: item.type,
      list_no: listNo,
      list_date: listDate,
      details: item.details.slice(0, 2000) || null,
      source_url: item.url || null,
      is_published: true,
    };

    const { data: existing } = await supabase
      .from("psc_categories")
      .select("id")
      .eq("cat_no", catNo)
      .maybeSingle();

    if (existing) {
      // Don't overwrite hand-set exam dates / papers / edits on re-import.
      const { error } = await supabase
        .from("psc_categories")
        .update({
          post_name: row.post_name,
          announcement_type: row.announcement_type,
          list_no: row.list_no,
          list_date: row.list_date,
          details: row.details,
          source_url: row.source_url,
        })
        .eq("id", (existing as { id: string }).id);
      if (error) throw new Error(error.message);
      updated++;
    } else {
      const { error } = await supabase.from("psc_categories").insert({
        ...row,
        paper_sections: [],
      });
      if (error) throw new Error(error.message);
      inserted++;
    }
  }

  revalidatePath("/psc-categories");
  return { inserted, updated };
}
