import type { Quiz } from "@/lib/types";
import { EXAM_SYLLABI } from "@/data/exam-syllabi";

/**
 * Per-mock landing-page helpers: resolve which exam a mock belongs to and
 * build its Malayalam title / description from live mock data.
 *
 * Nothing here is asserted about a mock's internal question mix — the
 * syllabus pattern shown on the landing page is the *exam's* published
 * pattern (from src/data/exam-syllabi.ts), labelled as such.
 */

export interface MockExamInfo {
  key: string;
  /** Short Malayalam label, e.g. "എൽ.ഡി.സി". */
  malayalamShort: string;
  /** Full Malayalam exam name, e.g. "ലോവർ ഡിവിഷൻ ക്ലാർക്ക്". */
  malayalamFull: string;
  englishName: string;
  /** Slug of the /exams/<slug>/syllabus page, when one exists. */
  syllabusSlug: string | null;
}

const EXAM_INFO: Record<string, MockExamInfo> = {
  ldc: {
    key: "ldc",
    malayalamShort: "എൽ.ഡി.സി",
    malayalamFull: "ലോവർ ഡിവിഷൻ ക്ലാർക്ക്",
    englishName: "Lower Division Clerk",
    syllabusSlug: "ldc",
  },
  lgs: {
    key: "lgs",
    malayalamShort: "എൽ.ജി.എസ്",
    malayalamFull: "ലാസ്റ്റ് ഗ്രേഡ് സെർവന്റ്",
    englishName: "Last Grade Servants",
    syllabusSlug: "lgs",
  },
  "police-constable": {
    key: "police-constable",
    malayalamShort: "പോലീസ് കോൺസ്റ്റബിൾ",
    malayalamFull: "പോലീസ് കോൺസ്റ്റബിൾ",
    englishName: "Police Constable",
    syllabusSlug: "police-constable",
  },
  "university-assistant": {
    key: "university-assistant",
    malayalamShort: "യൂണിവേഴ്സിറ്റി അസിസ്റ്റന്റ്",
    malayalamFull: "യൂണിവേഴ്സിറ്റി അസിസ്റ്റന്റ്",
    englishName: "University Assistant",
    syllabusSlug: "university-assistant",
  },
};

const GENERAL: MockExamInfo = {
  key: "general",
  malayalamShort: "കേരള പി.എസ്.സി",
  malayalamFull: "കേരള പബ്ലിക് സർവീസ് കമ്മീഷൻ",
  englishName: "Kerala PSC",
  syllabusSlug: null,
};

/** Trailing number in "LDC Mock Test 1" / "ldc-mock-test-1" / "Mock Test 16". */
export function mockNumber(mock: Quiz): number | null {
  for (const src of [mock.title, mock.slug]) {
    const m = src.match(/(\d+)\s*$/);
    if (m) return Number(m[1]);
  }
  return null;
}

function examKeyFromText(text: string): string | null {
  const t = text.toLowerCase();
  if (/(^|[^a-z])ldc([^a-z]|$)/.test(t)) return "ldc";
  if (/(^|[^a-z])lgs([^a-z]|$)/.test(t)) return "lgs";
  if (t.includes("police-constable") || t.includes("police constable"))
    return "police-constable";
  if (
    t.includes("university-assistant") ||
    t.includes("university assistant")
  )
    return "university-assistant";
  return null;
}

/** Which exam this mock belongs to (exam_slug → category → slug/title). */
export function resolveMockExam(mock: Quiz): MockExamInfo {
  const candidates = [
    mock.exam_slug,
    mock.exam_name,
    mock.category?.slug,
    mock.category?.name,
    mock.slug,
    mock.title,
  ].filter((c): c is string => Boolean(c));
  for (const c of candidates) {
    const key = examKeyFromText(c);
    if (key && EXAM_INFO[key]) return EXAM_INFO[key];
  }
  return GENERAL;
}

/** Malayalam landing title, e.g. "എൽ.ഡി.സി മോക്ക് ടെസ്റ്റ് 1". */
export function mockMalayalamTitle(mock: Quiz): string {
  const exam = resolveMockExam(mock);
  const n = mockNumber(mock);
  return n !== null
    ? `${exam.malayalamShort} മോക്ക് ടെസ്റ്റ് ${n}`
    : `${exam.malayalamShort} മോക്ക് ടെസ്റ്റ്`;
}

/** Malayalam SEO description built from live mock data. */
export function mockMalayalamDescription(
  mock: Quiz,
  questionCount: number,
  minutes: number | null
): string {
  const exam = resolveMockExam(mock);
  const neg = Number(mock.negative_marking ?? 0);
  const bits: string[] = [`${questionCount} ചോദ്യങ്ങൾ`];
  if (minutes) bits.push(`${minutes} മിനിറ്റ്`);
  bits.push(
    neg > 0 ? `${neg} നെഗറ്റീവ് മാർക്ക്` : "നെഗറ്റീവ് മാർക്കില്ല"
  );
  return (
    `${exam.malayalamFull} പരീക്ഷയ്ക്കുള്ള സൗജന്യ മോക്ക് ടെസ്റ്റ് — ` +
    `${bits.join(", ")}. പരീക്ഷാ രീതിയിൽ ടൈമറും ലീഡർബോർഡും സഹിതം ` +
    `പരിശീലിക്കൂ. ലോഗിൻ വേണ്ട, പൂർണ്ണമായും സൗജന്യം.`
  );
}

/** The exam's published syllabus pattern (prelims when present). */
export function mockSyllabusPattern(mock: Quiz) {
  const exam = resolveMockExam(mock);
  if (!exam.syllabusSlug) return null;
  const pattern = EXAM_SYLLABI[exam.syllabusSlug];
  if (!pattern) return null;
  return {
    exam,
    pattern,
    sections: pattern.prelims?.sections ?? pattern.sections,
    isPrelims: Boolean(pattern.prelims),
  };
}
