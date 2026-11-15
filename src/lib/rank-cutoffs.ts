/**
 * Pure helpers for the ranked-list / cut-off tools: community labels and
 * the "my rank vs past cut-offs" estimator. No fs / Supabase imports here
 * so the estimator can run in client components too.
 */

/** "270/2025" -> "270-2025" (URL slug). */
export function categorySlug(category: string): string {
  return category.replace("/", "-");
}

/** "270-2025" -> "270/2025". */
export function categoryFromSlug(slug: string): string {
  return slug.replace("-", "/");
}

export interface CutoffRow {
  category: string | null;
  post: string | null;
  list_no: string | null;
  year: number | null;
  community: string;
  cutoff_marks: number | null;
  cutoff_rank: number;
  main_count: number;
}

/** Malayalam label for a PSC community code (falls back to the code). */
export function communityLabel(code: string): string {
  const c = code.toUpperCase().trim();
  if (c === "ALL") return "എല്ലാ വിഭാഗവും";
  if (c === "EZHAVA" || c === "THIYYA" || c === "BILLAVA")
    return "ഈഴവ/തിയ്യ/ബില്ലവ";
  if (c === "M-MUSLIM" || c === "MUSLIM" || c === "M-MAPPILA")
    return "മുസ്ലിം";
  if (c === "LC" || c === "LC/AI" || c === "LATIN CATHOLIC/ANGLO INDIAN")
    return "ലത്തീൻ കത്തോലിക്ക/ആംഗ്ലോ ഇന്ത്യൻ";
  if (c === "OBC") return "ഒ.ബി.സി";
  if (c === "SIUC N" || c === "SIUC NADAR") return "എസ്.ഐ.യു.സി നാടാർ";
  if (c === "SCCC") return "പട്ടികജാതി ക്രിസ്ത്യൻ";
  if (c === "DHEEVARA" || c.startsWith("D-")) return "ധീവര";
  if (c === "H NADAR" || c === "HINDU NADAR") return "ഹിന്ദു നാടാർ";
  if (c.startsWith("SC-") || c === "SC") return "പട്ടികജാതി";
  if (c.startsWith("ST-") || c === "ST") return "പട്ടികവർഗം";
  if (c.startsWith("V-") || c === "V") return "വിശ്വകർമ്മ";
  if (c.startsWith("EZHAVA")) return "ഈഴവ/തിയ്യ/ബില്ലവ";
  return code;
}

export type EstimateVerdict = "above" | "near" | "below";

export interface EstimateResult {
  verdict: EstimateVerdict;
  headline: string;
  detail: string;
  basis: string;
  caveats: string[];
}

/**
 * Compare a rank and/or marks against a category's historical cut-offs.
 * `cutoffs` should be that category's rows (any list); the latest list's
 * ALL row is the primary reference. Never a guarantee — the result always
 * carries the caveats.
 */
export function estimateRank(input: {
  cutoffs: CutoffRow[];
  rank?: number | null;
  marks?: number | null;
  community?: string | null;
}): EstimateResult | null {
  const { cutoffs, rank, marks, community } = input;
  if ((!rank || rank <= 0) && (marks === null || marks === undefined)) {
    return null;
  }
  const latestYear = Math.max(...cutoffs.map((c) => c.year ?? 0));
  const latest = cutoffs.filter((c) => (c.year ?? 0) === latestYear);
  const allRow = latest.find((c) => c.community === "ALL");
  const commRow =
    community && community !== "ALL"
      ? latest.find((c) => c.community === community)
      : undefined;
  const ref = commRow ?? allRow;
  const caveats = [
    "ഇത് ഒരു കണക്കുകൂട്ടൽ മാത്രമാണ് — നിയമനം ഉറപ്പല്ല.",
    "കട്ട്-ഓഫ് ഓരോ വർഷവും ഒഴിവുകളുടെ എണ്ണവും അപേക്ഷകരുടെ നിലവാരവും അനുസരിച്ച് മാറും.",
    "സപ്ലിമെന്ററി ലിസ്റ്റുകളും എൻ.സി.എ ലിസ്റ്റുകളും വഴി കൂടുതൽ പേർക്ക് അവസരം ലഭിക്കാം.",
  ];

  if (marks !== null && marks !== undefined && ref?.cutoff_marks !== null && ref?.cutoff_marks !== undefined) {
    const diff = marks - ref.cutoff_marks;
    const basis = `${ref.year} ലെ ${communityLabel(ref.community)} കട്ട്-ഓഫ് മാർക്ക് ${ref.cutoff_marks} (റാങ്ക് ലിസ്റ്റ് ${ref.list_no ?? ""})`;
    if (diff >= 0) {
      return {
        verdict: "above",
        headline: "കട്ട്-ഓഫിന് മുകളിലാണ്",
        detail: `നിങ്ങളുടെ ${marks} മാർക്ക് ${ref.year} ലെ കട്ട്-ഓഫിനേക്കാൾ ${round1(diff)} മാർക്ക് കൂടുതലാണ്.`,
        basis,
        caveats,
      };
    }
    if (diff >= -5) {
      return {
        verdict: "near",
        headline: "കട്ട്-ഓഫിനടുത്താണ്",
        detail: `നിങ്ങളുടെ ${marks} മാർക്ക് ${ref.year} ലെ കട്ട്-ഓഫിനേക്കാൾ ${round1(-diff)} മാർക്ക് മാത്രം കുറവാണ്.`,
        basis,
        caveats,
      };
    }
    return {
      verdict: "below",
      headline: "കട്ട്-ഓഫിന് താഴെയാണ്",
      detail: `നിങ്ങളുടെ ${marks} മാർക്ക് ${ref.year} ലെ കട്ട്-ഓഫിനേക്കാൾ ${round1(-diff)} മാർക്ക് കുറവാണ്.`,
      basis,
      caveats,
    };
  }

  if (rank && rank > 0 && ref) {
    const lastRank = ref.cutoff_rank;
    const basis = `${ref.year} ലെ മെയിൻ ലിസ്റ്റിൽ ആകെ ${lastRank} പേരാണ് ഉണ്ടായിരുന്നത് (റാങ്ക് ലിസ്റ്റ് ${ref.list_no ?? ""})`;
    if (rank <= lastRank) {
      return {
        verdict: "above",
        headline: "മെയിൻ ലിസ്റ്റ് പരിധിക്കുള്ളിലാണ്",
        detail: `റാങ്ക് ${rank} എന്നത് ${ref.year} ലെ മെയിൻ ലിസ്റ്റിന്റെ അവസാന റാങ്കായ ${lastRank}-നുള്ളിലാണ്.`,
        basis,
        caveats,
      };
    }
    if (rank <= Math.round(lastRank * 1.5)) {
      return {
        verdict: "near",
        headline: "മെയിൻ ലിസ്റ്റ് പരിധിക്ക് അടുത്താണ്",
        detail: `റാങ്ക് ${rank} എന്നത് ${ref.year} ലെ മെയിൻ ലിസ്റ്റിന്റെ അവസാന റാങ്കായ ${lastRank}-നേക്കാൾ അല്പം കൂടുതലാണ് — സപ്ലിമെന്ററി ലിസ്റ്റ് വഴി അവസരം ലഭിച്ചേക്കാം.`,
        basis,
        caveats,
      };
    }
    return {
      verdict: "below",
      headline: "മെയിൻ ലിസ്റ്റ് പരിധിക്ക് പുറത്താണ്",
      detail: `റാങ്ക് ${rank} എന്നത് ${ref.year} ലെ മെയിൻ ലിസ്റ്റിന്റെ അവസാന റാങ്കായ ${lastRank}-നേക്കാൾ ഏറെ കൂടുതലാണ്.`,
      basis,
      caveats,
    };
  }

  return null;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
