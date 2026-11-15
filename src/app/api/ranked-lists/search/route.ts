import { NextResponse } from "next/server";
import { searchRankedLists } from "@/lib/ranked-lists";

/** GET /api/ranked-lists/search?q=<name or register number> */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (q.trim().length < 2) {
    return NextResponse.json({ entries: [], malayalamHint: false, totalIndexed: 0 });
  }
  const result = searchRankedLists(q, 50);
  return NextResponse.json({
    entries: result.entries.map((e) => ({
      rank: e.rank,
      regno: e.regno,
      name: e.name,
      total: e.total,
      community: e.community,
      section: e.section,
      list: {
        id: e.list.id,
        category: e.list.category,
        post: e.list.post,
        list_no: e.list.list_no,
        published_on: e.list.published_on,
        pdf_url: e.list.pdf_url,
        has_marks: e.list.has_marks,
      },
    })),
    malayalamHint: result.malayalamHint,
    totalIndexed: result.totalIndexed,
  });
}
