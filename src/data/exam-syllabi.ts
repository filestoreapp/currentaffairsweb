/**
 * Per-exam syllabus pattern data for the /exams/[slug]/syllabus pages.
 *
 * Numbers come from ~/workspace/.../seo-build/syllabus.json (facts only).
 * All Malayalam prose (intros, FAQs) is original to this site.
 *
 * Disputed facts are shown as NOT CONFIRMED, never asserted:
 * - LDC negative marking: sources disagree (see ldc.negativeMarkingNote).
 * - Police Constable duration: 90 min shown, 75 min conflict noted.
 * - University Assistant negative marking: expected, not confirmed.
 * - Secretariat Assistant negative marking: not in the notification scheme
 *   table; secondary sources agree on 0.33. Mains = two papers (100+100)
 *   + interview 20; the prelims slot in its entry renders Paper II
 *   (see comment in the entry), prelims split is in marksNote.
 * - VEO mains split: part names from the official 2019 programme;
 *   20/50/20/10 from prep sources, post-2021 mains unconfirmed;
 *   no official VEO PDF — the PSC syllabus index is linked instead.
 * - Staff Nurse duration: 90 min reported for 469/2024, 75 min claimed
 *   elsewhere; the all-nursing 10x10 split is verified from the official PDF.
 */

export interface ExamSyllabusSection {
  section: string;
  marks: number;
}

export interface ExamSyllabusFaq {
  q: string;
  a: string;
}

export interface ExamSyllabusPattern {
  slug: string;
  examName: string;
  shortName: string;
  /** English SEO title (keyword-rich, honest). On-page H1 is Malayalam. */
  seoTitle: string;
  seoDescription: string;
  malayalamTitle: string;
  malayalamSubtitle: string;
  intro: string[];
  level: string;
  totalMarks: number;
  duration: string;
  durationNote?: string;
  medium: string;
  negativeMarking: string;
  negativeMarkingNote?: string;
  syllabusStatus: "official" | "expected";
  statusNote: string;
  officialPdfUrl: string | null;
  officialIndexUrl?: string | null;
  sections: ExamSyllabusSection[];
  prelims?: {
    title: string;
    note: string;
    sections: ExamSyllabusSection[];
  };
  marksNote?: string;
  faqs: ExamSyllabusFaq[];
}

export const EXAM_SYLLABI: Record<string, ExamSyllabusPattern> = {
  ldc: {
    slug: "ldc",
    examName: "Lower Division Clerk",
    shortName: "LDC",
    seoTitle: "LDC Syllabus 2026 – Kerala PSC LD Clerk Exam Pattern, Marks & Topics",
    seoDescription:
      "Kerala PSC LDC syllabus: Lower Division Clerk exam pattern, section-wise marks for prelims and mains, negative marking status and official syllabus links.",
    malayalamTitle: "എൽഡിസി സിലബസ് 2026",
    malayalamSubtitle:
      "കേരള പിഎസ്‌സി ലോവർ ഡിവിഷൻ ക്ലാർക്ക് പരീക്ഷ — സിലബസ്, പരീക്ഷാ പാറ്റേൺ, മാർക്ക് വിതരണം",
    intro: [
      "കേരള പിഎസ്‌സിയുടെ ഏറ്റവും ജനപ്രിയമായ പത്താംതല പരീക്ഷയാണ് ലോവർ ഡിവിഷൻ ക്ലാർക്ക് (എൽഡിസി) പരീക്ഷ. സർക്കാർ വകുപ്പുകളിലെ ക്ലാർക്ക് തസ്തികകളിലേക്കാണ് ഈ പരീക്ഷ വഴി നിയമനം നടക്കുന്നത്.",
      "2027-ലെ സിലബസ് ഇതുവരെ ഔദ്യോഗികമായി പ്രഖ്യാപിച്ചിട്ടില്ലാത്തതിനാൽ, താഴെ കൊടുത്തിരിക്കുന്നത് മുൻ ഔദ്യോഗിക സിലബസിന്റെ അടിസ്ഥാനത്തിലുള്ള പ്രതീക്ഷിത സിലബസാണ്. ഔദ്യോഗിക വിജ്ഞാപനം വരുമ്പോൾ ഈ പേജ് പുതുക്കും.",
    ],
    level: "10th level (SSLC)",
    totalMarks: 100,
    duration: "1 hour 15 minutes",
    medium: "Malayalam, English, Tamil, Kannada",
    negativeMarking: "സ്ഥിരീകരിച്ചിട്ടില്ല",
    negativeMarkingNote:
      "ഈ കാര്യത്തിൽ സ്രോതസ്സുകൾ തമ്മിൽ അഭിപ്രായവ്യത്യാസമുണ്ട് — ചിലത് നെഗറ്റീവ് മാർക്കില്ല എന്നും മറ്റു ചിലത് ഓരോ തെറ്റായ ഉത്തരത്തിനും 0.33 മാർക്ക് കുറയ്ക്കുമെന്നും പറയുന്നു. നിങ്ങളുടെ ചക്രത്തിന്റെ ഔദ്യോഗിക വിജ്ഞാപനത്തിൽ ഉറപ്പുവരുത്തുക.",
    syllabusStatus: "expected",
    statusNote:
      "പ്രതീക്ഷിത സിലബസ് — 2027 സിലബസ് ഇതുവരെ ഔദ്യോഗികമായി പ്രഖ്യാപിച്ചിട്ടില്ല",
    officialPdfUrl: null,
    officialIndexUrl: "https://www.keralapsc.gov.in/syllabus1?tid=236&page=1",
    sections: [
      { section: "General Knowledge and Current Affairs", marks: 50 },
      { section: "Simple Arithmetic and Mental Ability", marks: 20 },
      { section: "General English", marks: 20 },
      { section: "Regional Language (Malayalam / Tamil / Kannada)", marks: 10 },
    ],
    prelims: {
      title: "പ്രിലിമിനറി പരീക്ഷ — പത്താംതല പൊതു പരീക്ഷ",
      note: "100 മാർക്ക് · 1 മണിക്കൂർ 15 മിനിറ്റ്. 2024 ജനുവരിയിലെ ഔദ്യോഗിക പ്രിലിമിനറി സിലബസാണ് ഇപ്പോഴും പ്രാബല്യത്തിലുള്ളത്.",
      sections: [
        { section: "General Knowledge", marks: 60 },
        { section: "General Science", marks: 20 },
        { section: "Simple Arithmetic & Mental Ability", marks: 20 },
      ],
    },
    faqs: [
      {
        q: "എൽഡിസി പരീക്ഷയിൽ ആകെ എത്ര മാർക്കാണ്?",
        a: "മെയിൻ പരീക്ഷയും പ്രിലിമിനറി പരീക്ഷയും ഓരോന്നും 100 മാർക്കിന്റേതാണ്. മെയിൻ പരീക്ഷയിൽ പൊതുവിജ്ഞാനവും കറന്റ് അഫയേഴ്സും ചേർന്ന് 50 മാർക്കും, ഗണിതവും മാനസിക ശേഷിയും 20 മാർക്കും, ഇംഗ്ലീഷ് 20 മാർക്കും, പ്രാദേശിക ഭാഷ 10 മാർക്കുമാണ്.",
      },
      {
        q: "എൽഡിസി 2027 സിലബസ് പ്രഖ്യാപിച്ചോ?",
        a: "ഇല്ല. 2026 ഒക്ടോബർ 1 വരെ പുതിയ സംസ്ഥാനതല എൽഡിസി വിജ്ഞാപനം പുറത്തിറങ്ങിയിട്ടില്ല; അവസാന ചക്രം കാറ്റഗറി 503/2023 ആണ്. ഈ പേജിലെ സിലബസ് മുൻ ഔദ്യോഗിക സിലബസിന്റെ അടിസ്ഥാനത്തിലുള്ള പ്രതീക്ഷിത സിലബസാണ്.",
      },
      {
        q: "എൽഡിസി പരീക്ഷയിൽ നെഗറ്റീവ് മാർക്കിങ് ഉണ്ടോ?",
        a: "ഇക്കാര്യം സ്ഥിരീകരിച്ചിട്ടില്ല. ചില സ്രോതസ്സുകൾ നെഗറ്റീവ് മാർക്കില്ല എന്നും മറ്റു ചിലത് ഓരോ തെറ്റായ ഉത്തരത്തിനും 0.33 മാർക്ക് കുറയ്ക്കുമെന്നും പറയുന്നു. നിങ്ങളുടെ ചക്രത്തിന്റെ ഔദ്യോഗിക വിജ്ഞാപനം നോക്കി ഉറപ്പുവരുത്തുക — അതാണ് അന്തിമമായ മാനദണ്ഡം.",
      },
      {
        q: "എൽഡിസി പരീക്ഷ രണ്ട് ഘട്ടങ്ങളായാണോ നടക്കുന്നത്?",
        a: "അതെ. ആദ്യം പത്താംതല പൊതു പ്രിലിമിനറി പരീക്ഷയും (പൊതുവിജ്ഞാനം 60, ജനറൽ സയൻസ് 20, ഗണിതവും മാനസിക ശേഷിയും 20) തുടർന്ന് തസ്തികയ്ക്ക് പ്രത്യേകമായുള്ള എൽഡിസി മെയിൻ പരീക്ഷയുമാണ്.",
      },
      {
        q: "എൽഡിസി പരീക്ഷ ഏത് ഭാഷകളിലാണ് നടക്കുന്നത്?",
        a: "ചോദ്യങ്ങൾ മലയാളം, ഇംഗ്ലീഷ്, തമിഴ്, കന്നഡ ഭാഷകളിൽ ലഭിക്കും. പ്രാദേശിക ഭാഷാ വിഭാഗം നിങ്ങൾ തിരഞ്ഞെടുക്കുന്ന ഭാഷയിലാണ്.",
      },
      {
        q: "മെയിൻ പരീക്ഷയിൽ ഏറ്റവും കൂടുതൽ മാർക്ക് ഏത് വിഭാഗത്തിനാണ്?",
        a: "പൊതുവിജ്ഞാനവും കറന്റ് അഫയേഴ്സും ചേർന്ന ഒറ്റ വിഭാഗത്തിന് 50 മാർക്കാണ് — ആകെ മാർക്കിന്റെ പകുതി. അതുകൊണ്ട് ദിനംപ്രതിയുള്ള കറന്റ് അഫയേഴ്സ് പഠനം ഏറ്റവും പ്രധാനമാണ്.",
      },
    ],
  },

  lgs: {
    slug: "lgs",
    examName: "Last Grade Servants",
    shortName: "LGS",
    seoTitle:
      "LGS Syllabus 2026 – Kerala PSC Last Grade Servants Exam Pattern, Marks & Topics",
    seoDescription:
      "Kerala PSC LGS syllabus: Last Grade Servants main exam pattern, section-wise marks, prelims syllabus, negative marking and official syllabus PDF.",
    malayalamTitle: "എൽജിഎസ് സിലബസ് 2026",
    malayalamSubtitle:
      "കേരള പിഎസ്‌സി ലാസ്റ്റ് ഗ്രേഡ് സെർവന്റ്സ് പരീക്ഷ — സിലബസ്, പരീക്ഷാ പാറ്റേൺ, മാർക്ക് വിതരണം",
    intro: [
      "കേരള സർക്കാർ വകുപ്പുകളിലെ ലാസ്റ്റ് ഗ്രേഡ് സെർവന്റ് തസ്തികകളിലേക്കുള്ള പരീക്ഷയാണ് എൽജിഎസ്. ഏറ്റവും കൂടുതൽ അപേക്ഷകർ എത്തുന്ന എൻട്രി ലെവൽ പിഎസ്‌സി പരീക്ഷകളിലൊന്നാണിത്.",
      "പ്രിലിമിനറി, മെയിൻ എന്നിങ്ങനെ രണ്ട് ഘട്ടങ്ങളായാണ് പരീക്ഷ നടക്കുന്നത്. താഴെ കൊടുത്തിരിക്കുന്ന മാർക്ക് വിതരണം മെയിൻ പരീക്ഷയുടേതാണ്.",
    ],
    level: "10th level (SSLC)",
    totalMarks: 100,
    duration: "1 hour 15 minutes",
    medium: "Malayalam, English, Tamil",
    negativeMarking: "ഓരോ തെറ്റായ ഉത്തരത്തിനും 0.33 മാർക്ക് കുറയും",
    syllabusStatus: "official",
    statusNote: "ഔദ്യോഗിക സിലബസ്",
    officialPdfUrl:
      "https://www.keralapsc.gov.in/sites/default/files/2023-01/uty_lgs__main_exam_syllabus.pdf",
    sections: [
      { section: "General Knowledge", marks: 40 },
      { section: "Current Affairs", marks: 20 },
      { section: "Science", marks: 10 },
      { section: "Public Health", marks: 10 },
      {
        section: "Simple Arithmetic, Mental Ability & Observational Skills",
        marks: 20,
      },
    ],
    prelims: {
      title: "പ്രിലിമിനറി പരീക്ഷ — പത്താംതല പൊതു പരീക്ഷ",
      note: "100 മാർക്ക് · 1 മണിക്കൂർ 15 മിനിറ്റ്. കമ്പനി ബോർഡ് എൽജിഎസ് (കാറ്റഗറി 423/2025) പ്രിലിമിനറി പരീക്ഷ 2026 ജൂലൈ 18-ന് നടന്നു.",
      sections: [
        { section: "General Knowledge", marks: 60 },
        { section: "General Science", marks: 20 },
        { section: "Simple Arithmetic & Mental Ability", marks: 20 },
      ],
    },
    marksNote:
      "ഈ വിഭാഗഘടന കമ്പനി ബോർഡ് എൽജിഎസ് (കാറ്റഗറി 423/2025) അടിസ്ഥാനമാക്കിയുള്ളതാണ്; ജനറൽ ഡിപ്പാർട്ട്മെന്റ് എൽജിഎസ് മെയിൻ പരീക്ഷയ്ക്കും ഇതേ ഘടനയാണ്.",
    faqs: [
      {
        q: "എൽജിഎസ് പരീക്ഷയുടെ ആകെ മാർക്ക് എത്രയാണ്?",
        a: "മെയിൻ പരീക്ഷ 100 മാർക്കിന്റേതാണ് — പൊതുവിജ്ഞാനം 40, കറന്റ് അഫയേഴ്സ് 20, സയൻസ് 10, പബ്ലിക് ഹെൽത്ത് 10, ഗണിതവും മാനസിക ശേഷിയും 20. പ്രിലിമിനറി പരീക്ഷയും 100 മാർക്കിന്റേതാണ്.",
      },
      {
        q: "എൽജിഎസ് പരീക്ഷയിൽ നെഗറ്റീവ് മാർക്കിങ് ഉണ്ടോ?",
        a: "അതെ. ഓരോ തെറ്റായ ഉത്തരത്തിനും 0.33 മാർക്ക് കുറയ്ക്കും. ഉത്തരം ഉറപ്പില്ലാത്ത ചോദ്യങ്ങൾ ഒഴിവാക്കുന്നതാണ് ബുദ്ധി.",
      },
      {
        q: "എൽജിഎസ് പരീക്ഷ രണ്ട് ഘട്ടങ്ങളായാണോ?",
        a: "അതെ. ആദ്യം പത്താംതല പൊതു പ്രിലിമിനറി പരീക്ഷയും (പൊതുവിജ്ഞാനം 60, ജനറൽ സയൻസ് 20, ഗണിതവും മാനസിക ശേഷിയും 20) തുടർന്ന് എൽജിഎസ് മെയിൻ പരീക്ഷയുമാണ്.",
      },
      {
        q: "എൽജിഎസ് മെയിൻ പരീക്ഷയിൽ പബ്ലിക് ഹെൽത്ത് എന്തുകൊണ്ട് ഉൾപ്പെടുന്നു?",
        a: "മെയിൻ സിലബസിൽ സയൻസിന് പുറമെ പബ്ലിക് ഹെൽത്തിന് പ്രത്യേകം 10 മാർക്ക് നൽകിയിട്ടുണ്ട് — ആരോഗ്യവുമായി ബന്ധപ്പെട്ട അടിസ്ഥാന അറിവുകളും പൊതുജനാരോഗ്യ പദ്ധതികളുമാണ് ഈ വിഭാഗത്തിൽ വരുന്നത്.",
      },
      {
        q: "ഔദ്യോഗിക എൽജിഎസ് സിലബസ് PDF എവിടെ കിട്ടും?",
        a: "ഈ പേജിലെ 'ഔദ്യോഗിക സിലബസ് PDF' ബട്ടൺ വഴി കേരള പിഎസ്‌സിയുടെ ഔദ്യോഗിക സൈറ്റിലുള്ള മെയിൻ പരീക്ഷാ സിലബസ് PDF ഡൗൺലോഡ് ചെയ്യാം.",
      },
      {
        q: "എൽജിഎസ് പരീക്ഷ ഏത് ഭാഷകളിലാണ്?",
        a: "ചോദ്യങ്ങൾ മലയാളം, ഇംഗ്ലീഷ്, തമിഴ് ഭാഷകളിൽ ലഭിക്കും.",
      },
    ],
  },

  "police-constable": {
    slug: "police-constable",
    examName: "Police Constable",
    shortName: "Police Constable",
    seoTitle:
      "Police Constable Syllabus 2026 – Kerala PSC CPO Exam Pattern, Marks & Topics",
    seoDescription:
      "Kerala PSC Police Constable syllabus: Civil Police Officer written exam pattern, section-wise marks, special topics, negative marking and official PDF.",
    malayalamTitle: "പോലീസ് കോൺസ്റ്റബിൾ സിലബസ് 2026",
    malayalamSubtitle:
      "കേരള പിഎസ്‌സി സിവിൽ പോലീസ് ഓഫീസർ പരീക്ഷ — സിലബസ്, പരീക്ഷാ പാറ്റേൺ, മാർക്ക് വിതരണം",
    intro: [
      "കേരള പോലീസിലെ സിവിൽ പോലീസ് ഓഫീസർ / ആംഡ് പോലീസ് ബറ്റാലിയൻ തസ്തികകളിലേക്കുള്ള പരീക്ഷയാണ് പോലീസ് കോൺസ്റ്റബിൾ പരീക്ഷ.",
      "എഴുത്തുപരീക്ഷയ്ക്ക് ശേഷം ശാരീരിക ക്ഷമതാ പരീക്ഷയും മെഡിക്കൽ പരിശോധനയും ഉണ്ടാകും. താഴെ കൊടുത്തിരിക്കുന്നത് എഴുത്തുപരീക്ഷയുടെ സിലബസും മാർക്ക് വിതരണവുമാണ്.",
    ],
    level: "Plus Two level (written exam); degree-level mains pattern shown",
    totalMarks: 100,
    duration: "1 hour 30 minutes",
    durationNote:
      "ചില സ്രോതസ്സുകൾ പ്ലസ് ടു തല പ്രിലിമിനറി പരീക്ഷയ്ക്ക് 75 മിനിറ്റ് എന്ന് പറയുന്നു; ഇവിടെ കൊടുത്തിരിക്കുന്ന 90 മിനിറ്റ് എഴുത്തുപരീക്ഷാ പാറ്റേണിന്റേതാണ്. നിങ്ങളുടെ കാറ്റഗറിയുടെ വിജ്ഞാപനത്തിൽ ഉറപ്പുവരുത്തുക.",
    medium: "English, Malayalam, Tamil, Kannada",
    negativeMarking: "ഓരോ തെറ്റായ ഉത്തരത്തിനും 0.33 മാർക്ക് കുറയും",
    syllabusStatus: "official",
    statusNote: "ഔദ്യോഗിക സിലബസ്",
    officialPdfUrl:
      "https://www.keralapsc.gov.in/sites/default/files/2024-01/Police%20Constable-corrected.pdf",
    sections: [
      { section: "General Knowledge", marks: 40 },
      { section: "Current Affairs", marks: 10 },
      {
        section: "Arithmetic, Mental Ability and Observational Skills",
        marks: 10,
      },
      { section: "General English", marks: 10 },
      {
        section: "Regional Language (Malayalam / Tamil / Kannada)",
        marks: 10,
      },
      {
        section: "Special Topics (job-specific, related to nature of duties)",
        marks: 20,
      },
    ],
    faqs: [
      {
        q: "പോലീസ് കോൺസ്റ്റബിൾ എഴുത്തുപരീക്ഷയുടെ ആകെ മാർക്ക് എത്രയാണ്?",
        a: "100 മാർക്കാണ് — പൊതുവിജ്ഞാനം 40, കറന്റ് അഫയേഴ്സ് 10, ഗണിതവും മാനസിക ശേഷിയും 10, ഇംഗ്ലീഷ് 10, പ്രാദേശിക ഭാഷ 10, സ്പെഷ്യൽ ടോപ്പിക്സ് 20.",
      },
      {
        q: "പരീക്ഷയുടെ സമയം എത്രയാണ്?",
        a: "എഴുത്തുപരീക്ഷയ്ക്ക് 90 മിനിറ്റാണ് ഇവിടെ രേഖപ്പെടുത്തിയിരിക്കുന്നത്. എന്നാൽ ചില സ്രോതസ്സുകൾ പ്ലസ് ടു തല പ്രിലിമിനറി പരീക്ഷയ്ക്ക് 75 മിനിറ്റ് എന്ന് പറയുന്നു — നിങ്ങളുടെ കാറ്റഗറിയുടെ വിജ്ഞാപനത്തിൽ സമയം ഉറപ്പുവരുത്തുക.",
      },
      {
        q: "നെഗറ്റീവ് മാർക്കിങ് ഉണ്ടോ?",
        a: "അതെ. ഓരോ തെറ്റായ ഉത്തരത്തിനും 0.33 മാർക്ക് കുറയ്ക്കും.",
      },
      {
        q: "സ്പെഷ്യൽ ടോപ്പിക്സ് 20 മാർക്ക് എന്താണ്?",
        a: "പോലീസ് ജോലിയുടെ സ്വഭാവവുമായി ബന്ധപ്പെട്ട പ്രത്യേക വിഷയങ്ങളാണ് ഈ വിഭാഗത്തിൽ വരുന്നത് — 20 മാർക്കുണ്ട്, അതുകൊണ്ട് ഇത് ഒഴിവാക്കരുത്.",
      },
      {
        q: "എഴുത്തുപരീക്ഷയ്ക്ക് ശേഷം എന്താണ്?",
        a: "എഴുത്തുപരീക്ഷയിൽ യോഗ്യത നേടുന്നവർക്ക് ശാരീരിക ക്ഷമതാ പരീക്ഷയും (PET) തുടർന്ന് മെഡിക്കൽ പരിശോധനയും ഉണ്ടാകും.",
      },
      {
        q: "ഔദ്യോഗിക സിലബസ് PDF എവിടെ കിട്ടും?",
        a: "ഈ പേജിലെ 'ഔദ്യോഗിക സിലബസ് PDF' ബട്ടൺ വഴി കേരള പിഎസ്‌സിയുടെ ഔദ്യോഗിക സൈറ്റിലുള്ള പോലീസ് കോൺസ്റ്റബിൾ സിലബസ് PDF ഡൗൺലോഡ് ചെയ്യാം.",
      },
    ],
  },

  "university-assistant": {
    slug: "university-assistant",
    examName: "University Assistant",
    shortName: "University Assistant",
    seoTitle:
      "University Assistant Syllabus 2026 – Kerala PSC Mains Exam Pattern, Marks & Topics",
    seoDescription:
      "Kerala PSC University Assistant syllabus: degree-level mains exam pattern, section-wise marks, prelims pattern, negative marking status and exam details.",
    malayalamTitle: "യൂണിവേഴ്സിറ്റി അസിസ്റ്റന്റ് സിലബസ് 2026",
    malayalamSubtitle:
      "കേരള പിഎസ്‌സി യൂണിവേഴ്സിറ്റി അസിസ്റ്റന്റ് (മെയിൻ) പരീക്ഷ — സിലബസ്, പരീക്ഷാ പാറ്റേൺ, മാർക്ക് വിതരണം",
    intro: [
      "കേരളത്തിലെ സർവകലാശാലകളിലെ അസിസ്റ്റന്റ് തസ്തികയിലേക്കുള്ള ഡിഗ്രിതല പരീക്ഷയാണ് യൂണിവേഴ്സിറ്റി അസിസ്റ്റന്റ് പരീക്ഷ.",
      "കാറ്റഗറി 454/2025 പ്രകാരമുള്ള മെയിൻ പരീക്ഷ 2026 ഒക്ടോബർ 14-ന് രാവിലെ 7:00–8:50-ന് OMR രീതിയിൽ നടന്നു — 100 ചോദ്യങ്ങൾ, 100 മാർക്ക്.",
    ],
    level: "Degree level (Mains)",
    totalMarks: 100,
    duration: "1 hour 30 minutes",
    medium: "English, Malayalam, Tamil, Kannada",
    negativeMarking: "പ്രതീക്ഷിക്കുന്നത് 0.33 — സ്ഥിരീകരിച്ചിട്ടില്ല",
    negativeMarkingNote:
      "ഓരോ തെറ്റായ ഉത്തരത്തിനും 0.33 മാർക്ക് കുറയ്ക്കുമെന്നാണ് പ്രതീക്ഷിക്കുന്നത്, പക്ഷേ ഔദ്യോഗിക സിലബസ് രേഖയിൽ ഇത് സ്ഥിരീകരിച്ചിട്ടില്ല. ഔദ്യോഗിക വിജ്ഞാപനത്തിൽ ഉറപ്പുവരുത്തുക.",
    syllabusStatus: "official",
    statusNote: "ഔദ്യോഗിക സിലബസ്",
    officialPdfUrl: null,
    sections: [
      { section: "General Knowledge", marks: 55 },
      { section: "Current Affairs", marks: 15 },
      { section: "Simple Arithmetic & Mental Ability", marks: 10 },
      { section: "General English", marks: 10 },
      {
        section: "Regional Language (Malayalam / Tamil / Kannada)",
        marks: 10,
      },
    ],
    prelims: {
      title: "പ്രിലിമിനറി പരീക്ഷ — ഡിഗ്രിതല പൊതു പരീക്ഷ",
      note: "100 മാർക്ക്. മെയിൻ പരീക്ഷയ്ക്ക് മുമ്പുള്ള സ്ക്രീനിങ് പരീക്ഷയാണിത്.",
      sections: [
        { section: "General Knowledge", marks: 50 },
        {
          section: "Simple Arithmetic, Mental Ability & Reasoning",
          marks: 20,
        },
        { section: "General English", marks: 20 },
        {
          section: "Regional Language (Malayalam / Tamil / Kannada)",
          marks: 10,
        },
      ],
    },
    marksNote:
      "വിഭാഗംതിരിച്ചുള്ള മാർക്ക് വിതരണം മുൻ ചക്രങ്ങളിലെ രീതിയിൽ നിന്നുള്ള പുനർനിർമാണമാണ്; ഔദ്യോഗിക 454/2025 PDF-ൽ ഉറപ്പുവരുത്തുക.",
    faqs: [
      {
        q: "യൂണിവേഴ്സിറ്റി അസിസ്റ്റന്റ് മെയിൻ പരീക്ഷയുടെ ആകെ മാർക്ക് എത്രയാണ്?",
        a: "100 മാർക്കാണ് — 100 ചോദ്യങ്ങൾ. പൊതുവിജ്ഞാനം 55, കറന്റ് അഫയേഴ്സ് 15, ഗണിതവും മാനസിക ശേഷിയും 10, ഇംഗ്ലീഷ് 10, പ്രാദേശിക ഭാഷ 10 എന്നിങ്ങനെയാണ് വിതരണം.",
      },
      {
        q: "2026-ലെ യൂണിവേഴ്സിറ്റി അസിസ്റ്റന്റ് മെയിൻ പരീക്ഷ എപ്പോഴാണ് നടന്നത്?",
        a: "കാറ്റഗറി 454/2025 പ്രകാരമുള്ള മെയിൻ പരീക്ഷ 2026 ഒക്ടോബർ 14-ന് രാവിലെ 7:00 മുതൽ 8:50 വരെ OMR രീതിയിൽ നടന്നു.",
      },
      {
        q: "നെഗറ്റീവ് മാർക്കിങ് ഉണ്ടോ?",
        a: "ഓരോ തെറ്റായ ഉത്തരത്തിനും 0.33 മാർക്ക് കുറയ്ക്കുമെന്നാണ് പ്രതീക്ഷിക്കുന്നത്, പക്ഷേ ഇത് ഔദ്യോഗികമായി സ്ഥിരീകരിച്ചിട്ടില്ല. ഔദ്യോഗിക വിജ്ഞാപനത്തിൽ ഉറപ്പുവരുത്തുക.",
      },
      {
        q: "ഡിഗ്രിതല പ്രിലിമിനറി പരീക്ഷയുടെ പാറ്റേൺ എന്താണ്?",
        a: "പ്രിലിമിനറി പരീക്ഷയും 100 മാർക്കിന്റേതാണ് — പൊതുവിജ്ഞാനം 50, ഗണിതവും മാനസിക ശേഷിയും റീസണിങ്ങും 20, ഇംഗ്ലീഷ് 20, പ്രാദേശിക ഭാഷ 10.",
      },
      {
        q: "പരീക്ഷ ഏത് ഭാഷകളിലാണ്?",
        a: "ചോദ്യങ്ങൾ ഇംഗ്ലീഷിലും മലയാളം/തമിഴ്/കന്നഡ ഭാഷകളിലുമാണ്. ചില ഭാഗങ്ങൾ ഇംഗ്ലീഷിൽ മാത്രവും ചിലത് പ്രാദേശിക ഭാഷയിലുമാണ്.",
      },
      {
        q: "പൊതുവിജ്ഞാനത്തിന് എത്ര മാർക്ക്?",
        a: "മെയിൻ പരീക്ഷയിൽ പൊതുവിജ്ഞാനത്തിന് 55 മാർക്കുണ്ട് — ആകെ മാർക്കിന്റെ പകുതിയിലധികം. കേരള ചരിത്രം, ഇന്ത്യൻ രാഷ്ട്രീയം, ഭരണം എന്നിവയ്ക്ക് പ്രത്യേകം ശ്രദ്ധ കൊടുക്കുക.",
      },
    ],
  },
  "secretariat-assistant": {
    slug: "secretariat-assistant",
    examName: "Secretariat Assistant",
    shortName: "Secretariat Assistant",
    seoTitle:
      "Secretariat Assistant Syllabus 2026 – Kerala PSC Mains Paper I & II Pattern, Marks & Topics",
    seoDescription:
      "Kerala PSC Secretariat Assistant syllabus: degree-level prelims and mains Paper I & II section-wise marks, interview, negative marking and official syllabus PDFs.",
    malayalamTitle: "സെക്രട്ടേറിയറ്റ് അസിസ്റ്റന്റ് സിലബസ് 2026",
    malayalamSubtitle:
      "കേരള പിഎസ്‌സി സെക്രട്ടേറിയറ്റ് അസിസ്റ്റന്റ് / ഓഡിറ്റർ പരീക്ഷ — സിലബസ്, പരീക്ഷാ പാറ്റേൺ, മാർക്ക് വിതരണം",
    intro: [
      "സർക്കാർ സെക്രട്ടേറിയറ്റ്, കേരള പിഎസ്‌സി, അഡ്വക്കേറ്റ് ജനറലിന്റെ ഓഫീസ്, സ്റ്റേറ്റ് ഓഡിറ്റ് വകുപ്പ് തുടങ്ങിയ സ്ഥാപനങ്ങളിലെ അസിസ്റ്റന്റ് / ഓഡിറ്റർ തസ്തികകളിലേക്കുള്ള ഡിഗ്രിതല പരീക്ഷയാണ് സെക്രട്ടേറിയറ്റ് അസിസ്റ്റന്റ് പരീക്ഷ.",
      "പ്രിലിമിനറി പരീക്ഷ (സ്ക്രീനിങ്), മെയിൻ പരീക്ഷ (പേപ്പർ I, പേപ്പർ II), ഇന്റർവ്യൂ എന്നിങ്ങനെ മൂന്ന് ഘട്ടങ്ങളായാണ് പരീക്ഷ നടക്കുന്നത്. പ്രിലിമിനറി മാർക്ക് റാങ്കിങ്ങിൽ പരിഗണിക്കില്ല — മെയിൻ പരീക്ഷയുടെയും ഇന്റർവ്യൂവിന്റെയും മാർക്കാണ് റാങ്ക് നിശ്ചയിക്കുന്നത്. താഴെ കൊടുത്തിരിക്കുന്ന ആദ്യ പട്ടിക മെയിൻ പേപ്പർ I-ന്റേതാണ്; പേപ്പർ II-ന്റെ വിതരണം അതിന് താഴെയുണ്ട്.",
    ],
    level: "Degree level",
    totalMarks: 200,
    duration: "1 hour 30 minutes (per mains paper)",
    durationNote:
      "പ്രിലിമിനറി പരീക്ഷ 1 മണിക്കൂർ 15 മിനിറ്റാണ്. ഓരോ മെയിൻ പേപ്പറും 1 മണിക്കൂർ 30 മിനിറ്റ് വീതമാണ്.",
    medium: "English, Malayalam, Tamil, Kannada",
    negativeMarking: "ഓരോ തെറ്റായ ഉത്തരത്തിനും 0.33 മാർക്ക് കുറയും",
    negativeMarkingNote:
      "വിജ്ഞാപനത്തിന്റെ സ്കീം പട്ടികയിൽ നെഗറ്റീവ് മാർക്കിങ് രേഖപ്പെടുത്തിയിട്ടില്ല; ഒന്നിലധികം ദ്വിതീയ സ്രോതസ്സുകൾ 0.33 എന്നാണ് പറയുന്നത്. നിങ്ങളുടെ കാറ്റഗറിയുടെ വിജ്ഞാപനത്തിൽ ഉറപ്പുവരുത്തുക.",
    syllabusStatus: "official",
    statusNote:
      "ഔദ്യോഗിക സിലബസ് — കാറ്റഗറി 576/2024 മെയിൻ പരീക്ഷ 2025 സെപ്റ്റംബർ 27-ന് നടന്നു; ഷോർട്ട്ലിസ്റ്റ് 2025 ഡിസംബർ 6-ന് പ്രസിദ്ധീകരിച്ചു",
    officialPdfUrl:
      "https://www.keralapsc.gov.in/sites/default/files/2025-01/syllabus_0.pdf",
    // Main table = Mains Paper I (100). The prelims slot below is reused for
    // Mains Paper II (the template renders it as a second titled table);
    // the prelims split itself is described in marksNote.
    sections: [
      { section: "History", marks: 7 },
      { section: "Geography", marks: 7 },
      { section: "Economics", marks: 7 },
      { section: "Life Science & Public Health", marks: 7 },
      { section: "Physics", marks: 7 },
      { section: "Chemistry", marks: 7 },
      { section: "Arts / Literature / Culture", marks: 8 },
      { section: "Sports", marks: 3 },
      { section: "Basics of Computer", marks: 6 },
      {
        section: "Simple Arithmetic, Mental Ability & Reasoning",
        marks: 15,
      },
      { section: "General English", marks: 13 },
      {
        section: "Regional Language (Malayalam / Kannada / Tamil)",
        marks: 13,
      },
    ],
    prelims: {
      title: "മെയിൻ പരീക്ഷ — പേപ്പർ II",
      note: "100 മാർക്ക് · 1 മണിക്കൂർ 30 മിനിറ്റ്. ഭരണം, മാനേജ്മെന്റ്, ഭരണഘടന, കേരള സമ്പദ്‌വ്യവസ്ഥ എന്നിവയാണ് പേപ്പർ II-ന്റെ വിഷയങ്ങൾ.",
      sections: [
        { section: "Principles of Administration", marks: 10 },
        { section: "Principles of Management", marks: 10 },
        { section: "Constitutional Structure", marks: 12 },
        {
          section: "Centre-State Relations under the Constitution",
          marks: 8,
        },
        { section: "Kerala's Economy", marks: 15 },
        { section: "Kerala Model of Development", marks: 15 },
        { section: "Environment / Climate", marks: 10 },
        { section: "Disaster Management", marks: 10 },
        { section: "E-Governance", marks: 10 },
      ],
    },
    marksNote:
      "മെയിൻ പരീക്ഷ 200 മാർക്കിന്റേതാണ് (പേപ്പർ I 100 + പേപ്പർ II 100); ഇന്റർവ്യൂ 20 മാർക്ക് — റാങ്കിങ് ആകെ 220 മാർക്കിൽ. പ്രിലിമിനറി പരീക്ഷ (ഡിഗ്രിതല പൊതു പരീക്ഷ) 100 മാർക്കിന്റേതാണ് — പൊതുവിജ്ഞാനം 50, ഗണിതവും മാനസിക ശേഷിയും റീസണിങ്ങും 20, ഇംഗ്ലീഷ് 20, പ്രാദേശിക ഭാഷ 10; ഇത് സ്ക്രീനിങ് മാത്രമാണ്.",
    faqs: [
      {
        q: "സെക്രട്ടേറിയറ്റ് അസിസ്റ്റന്റ് പരീക്ഷയിൽ ആകെ എത്ര മാർക്കാണ്?",
        a: "മെയിൻ പരീക്ഷ 200 മാർക്കിന്റേതാണ് — പേപ്പർ I 100-ഉം പേപ്പർ II 100-ഉം. ഇന്റർവ്യൂ 20 മാർക്ക് കൂടി ചേർത്ത് 220 മാർക്കിലാണ് റാങ്കിങ്. പ്രിലിമിനറി പരീക്ഷ 100 മാർക്കിന്റേതാണ്, പക്ഷേ അത് സ്ക്രീനിങ് മാത്രമാണ്; അതിന്റെ മാർക്ക് റാങ്കിങ്ങിൽ പരിഗണിക്കില്ല.",
      },
      {
        q: "മെയിൻ പേപ്പർ I-ൽ ഏറ്റവും കൂടുതൽ മാർക്ക് ഏത് വിഭാഗത്തിനാണ്?",
        a: "ഗണിതവും മാനസിക ശേഷിയും റീസണിങ്ങും ചേർന്ന് 15 മാർക്കാണ് ഏറ്റവും കൂടുതൽ. ഇംഗ്ലീഷിനും പ്രാദേശിക ഭാഷയ്ക്കും 13 മാർക്ക് വീതമുണ്ട്.",
      },
      {
        q: "മെയിൻ പേപ്പർ II-ൽ എന്തൊക്കെയാണ് വരുന്നത്?",
        a: "ഭരണത്തിന്റെ തത്ത്വങ്ങൾ, മാനേജ്മെന്റ്, ഭരണഘടനാ ഘടന, കേന്ദ്ര-സംസ്ഥാന ബന്ധങ്ങൾ, കേരള സമ്പദ്‌വ്യവസ്ഥ, കേരള വികസന മാതൃക, പരിസ്ഥിതി, ദുരന്ത നിവാരണം, ഇ-ഗവേണൻസ് എന്നിവയാണ് പേപ്പർ II-ന്റെ ഒൻപത് മൊഡ്യൂളുകൾ.",
      },
      {
        q: "നെഗറ്റീവ് മാർക്കിങ് ഉണ്ടോ?",
        a: "ഓരോ തെറ്റായ ഉത്തരത്തിനും 0.33 മാർക്ക് കുറയ്ക്കുമെന്നാണ് ഒന്നിലധികം സ്രോതസ്സുകൾ പറയുന്നത്. എന്നാൽ വിജ്ഞാപനത്തിന്റെ സ്കീം പട്ടികയിൽ ഇത് രേഖപ്പെടുത്തിയിട്ടില്ല — നിങ്ങളുടെ കാറ്റഗറിയുടെ വിജ്ഞാപനത്തിൽ ഉറപ്പുവരുത്തുക.",
      },
      {
        q: "അടുത്ത സെക്രട്ടേറിയറ്റ് അസിസ്റ്റന്റ് പരീക്ഷ എപ്പോഴാണ്?",
        a: "കാറ്റഗറി 058/2026 (എസ്.ടി. വിഭാഗത്തിന് മാത്രമുള്ള പ്രത്യേക നിയമനം) പ്രകാരമുള്ള പരീക്ഷ 2027 ജനുവരി 30-ന് നടക്കും — രണ്ട് പേപ്പറുകൾ, OMR രീതി. കൺഫർമേഷൻ സമയപരിധി 26/10–14/11/2026 ആയിരുന്നു.",
      },
      {
        q: "576/2024 കാറ്റഗറിയുടെ നില എന്താണ്?",
        a: "മെയിൻ പരീക്ഷ 2025 സെപ്റ്റംബർ 27-ന് നടന്നു; ഷോർട്ട്ലിസ്റ്റ് 2025 ഡിസംബർ 6-ന് പ്രസിദ്ധീകരിച്ചു. ഇന്റർവ്യൂ തീയതി ഇതുവരെ പ്രഖ്യാപിച്ചിട്ടില്ല.",
      },
    ],
  },

  veo: {
    slug: "veo",
    examName: "Village Extension Officer",
    shortName: "VEO",
    seoTitle:
      "VEO Syllabus 2026 – Kerala PSC Village Extension Officer Exam Pattern, Marks & Topics",
    seoDescription:
      "Kerala PSC VEO syllabus: Village Extension Officer main exam pattern, section-wise marks, prelims pattern, negative marking and exam details.",
    malayalamTitle: "വിഇഒ സിലബസ് 2026",
    malayalamSubtitle:
      "കേരള പിഎസ്‌സി വില്ലേജ് എക്സ്റ്റൻഷൻ ഓഫീസർ പരീക്ഷ — സിലബസ്, പരീക്ഷാ പാറ്റേൺ, മാർക്ക് വിതരണം",
    intro: [
      "ഗ്രാമവികസന വകുപ്പിലെ വില്ലേജ് എക്സ്റ്റൻഷൻ ഓഫീസർ ഗ്രേഡ് II തസ്തികയിലേക്കുള്ള പത്താംതല പരീക്ഷയാണ് വിഇഒ പരീക്ഷ.",
      "2021 മുതൽ രണ്ട് ഘട്ടങ്ങളായാണ് പരീക്ഷ നടക്കുന്നത് — ആദ്യം പത്താംതല പൊതു പ്രിലിമിനറി പരീക്ഷയും തുടർന്ന് വിഇഒ മെയിൻ പരീക്ഷയും. റാങ്ക് ലിസ്റ്റ് മെയിൻ പരീക്ഷയുടെ മാർക്കിന്റെ അടിസ്ഥാനത്തിലാണ്.",
    ],
    level: "10th level (SSLC)",
    totalMarks: 100,
    duration: "1 hour 15 minutes",
    durationNote:
      "2019-ലെ ഒറ്റ പരീക്ഷയും പ്രിലിമിനറി പരീക്ഷയും 75 മിനിറ്റായിരുന്നു. മെയിൻ പരീക്ഷയുടെ സമയം ഔദ്യോഗികമായി സ്ഥിരീകരിച്ചിട്ടില്ല.",
    medium: "Malayalam, Tamil, Kannada (General English in English)",
    negativeMarking: "ഓരോ തെറ്റായ ഉത്തരത്തിനും 0.33 മാർക്ക് കുറയും",
    syllabusStatus: "expected",
    statusNote:
      "പ്രതീക്ഷിത സിലബസ് — 2019-ലെ ഔദ്യോഗിക പരീക്ഷാ പദ്ധതിയും പത്താംതല പാറ്റേണും അടിസ്ഥാനമാക്കിയുള്ളത്; പുതിയ വിജ്ഞാപനം വന്നിട്ടില്ല",
    officialPdfUrl: null,
    officialIndexUrl: "https://www.keralapsc.gov.in/syllabus",
    sections: [
      { section: "Simple Arithmetic & Mental Ability", marks: 20 },
      { section: "General Knowledge & Current Affairs", marks: 50 },
      { section: "General English", marks: 20 },
      {
        section: "Regional Language (Malayalam / Tamil / Kannada)",
        marks: 10,
      },
    ],
    prelims: {
      title: "പ്രിലിമിനറി പരീക്ഷ — പത്താംതല പൊതു പരീക്ഷ",
      note: "100 മാർക്ക് · 1 മണിക്കൂർ 15 മിനിറ്റ്. മെയിൻ പരീക്ഷയ്ക്ക് യോഗ്യത നേടാനുള്ള സ്ക്രീനിങ് പരീക്ഷ മാത്രമാണ്; പ്രിലിമിനറി മാർക്ക് റാങ്കിങ്ങിൽ പരിഗണിക്കില്ല.",
      sections: [
        { section: "General Knowledge", marks: 60 },
        { section: "General Science", marks: 20 },
        { section: "Simple Arithmetic & Mental Ability", marks: 20 },
      ],
    },
    marksNote:
      "മെയിൻ പരീക്ഷയുടെ വിഭാഗങ്ങളും അവയുടെ ക്രമവും 2019-ലെ ഔദ്യോഗിക പരീക്ഷാ പദ്ധതിയിൽ നിന്നുള്ളതാണ്. 20/50/20/10 എന്ന മാർക്ക് വിതരണത്തെക്കുറിച്ച് ഒന്നിലധികം സ്രോതസ്സുകൾ യോജിക്കുന്നുണ്ട്, പക്ഷേ ഔദ്യോഗിക പദ്ധതിയിൽ മാർക്ക് രേഖപ്പെടുത്തിയിട്ടില്ല; 2021 മുതലുള്ള മെയിൻ പരീക്ഷയും ഇതേ വിതരണം തന്നെയാണോ എന്ന് സ്ഥിരീകരിച്ചിട്ടില്ല.",
    faqs: [
      {
        q: "വിഇഒ പരീക്ഷയുടെ ആകെ മാർക്ക് എത്രയാണ്?",
        a: "മെയിൻ പരീക്ഷ 100 മാർക്കിന്റേതാണ് — ഗണിതവും മാനസിക ശേഷിയും 20, പൊതുവിജ്ഞാനവും കറന്റ് അഫയേഴ്സും 50, ഇംഗ്ലീഷ് 20, പ്രാദേശിക ഭാഷ 10. പ്രിലിമിനറി പരീക്ഷയും 100 മാർക്കിന്റേതാണ്.",
      },
      {
        q: "വിഇഒ പരീക്ഷ രണ്ട് ഘട്ടങ്ങളായാണോ?",
        a: "അതെ, 2021 മുതൽ. ആദ്യം പത്താംതല പൊതു പ്രിലിമിനറി പരീക്ഷയും (പൊതുവിജ്ഞാനം 60, സയൻസ് 20, ഗണിതവും മാനസിക ശേഷിയും 20) തുടർന്ന് വിഇഒ മെയിൻ പരീക്ഷയുമാണ്. റാങ്ക് മെയിൻ മാർക്കിന്റെ അടിസ്ഥാനത്തിലാണ്.",
      },
      {
        q: "നെഗറ്റീവ് മാർക്കിങ് ഉണ്ടോ?",
        a: "അതെ. ഓരോ തെറ്റായ ഉത്തരത്തിനും 0.33 മാർക്ക് കുറയ്ക്കും; ഉത്തരം എഴുതാത്ത ചോദ്യങ്ങൾക്ക് മാർക്ക് കുറയില്ല.",
      },
      {
        q: "വിഇഒ പരീക്ഷയ്ക്ക് എന്ത് യോഗ്യതയാണ് വേണ്ടത്?",
        a: "എസ്എസ്എൽസി (പത്താംതലം) ആണ് കുറഞ്ഞ യോഗ്യത — 2018-ലെ വിജ്ഞാപനപ്രകാരം എസ്എസ്എൽസിയിൽ 40% മാർക്കെങ്കിലും വേണം.",
      },
      {
        q: "അടുത്ത വിഇഒ വിജ്ഞാപനം എപ്പോഴാണ്?",
        a: "അവസാന പൊതു വിജ്ഞാപനം 276/2018 ആണ് (പരീക്ഷ 2019 നവംബറിൽ); എസ്.സി/എസ്.ടി പ്രത്യേക നിയമനം 307/2020-ന്റെ പ്രിലിമിനറി 2021-ലും നടന്നു. അതിനുശേഷം പുതിയ വിജ്ഞാപനം വന്നിട്ടില്ല — keralapsc.gov.in-ൽ നോക്കുക.",
      },
      {
        q: "മെയിൻ പരീക്ഷയിൽ ഏറ്റവും കൂടുതൽ മാർക്ക് ഏത് വിഭാഗത്തിനാണ്?",
        a: "പൊതുവിജ്ഞാനവും കറന്റ് അഫയേഴ്സും ചേർന്ന് 50 മാർക്ക് — ആകെ മാർക്കിന്റെ പകുതി. അതുകൊണ്ട് ദിനംപ്രതിയുള്ള കറന്റ് അഫയേഴ്സ് പഠനം ഏറ്റവും പ്രധാനമാണ്.",
      },
    ],
  },

  "staff-nurse": {
    slug: "staff-nurse",
    examName: "Staff Nurse Grade II",
    shortName: "Staff Nurse",
    seoTitle:
      "Staff Nurse Syllabus 2026 – Kerala PSC Staff Nurse Gr II Exam Pattern, Marks & Topics",
    seoDescription:
      "Kerala PSC Staff Nurse Grade II syllabus: 10 nursing modules, 100 marks, single OMR exam pattern, negative marking and official syllabus PDF.",
    malayalamTitle: "സ്റ്റാഫ് നഴ്സ് സിലബസ് 2026",
    malayalamSubtitle:
      "കേരള പിഎസ്‌സി സ്റ്റാഫ് നഴ്സ് ഗ്രേഡ് II പരീക്ഷ — സിലബസ്, പരീക്ഷാ പാറ്റേൺ, മാർക്ക് വിതരണം",
    intro: [
      "ആരോഗ്യ വകുപ്പ്, മെഡിക്കൽ വിദ്യാഭ്യാസ വകുപ്പ്, ഇൻഷുറൻസ് മെഡിക്കൽ സർവീസസ് എന്നിവിടങ്ങളിലെ സ്റ്റാഫ് നഴ്സ് ഗ്രേഡ് II തസ്തികയിലേക്കുള്ള സാങ്കേതിക പരീക്ഷയാണ് സ്റ്റാഫ് നഴ്സ് പരീക്ഷ. ബി.എസ്‌സി നഴ്സിങ് അല്ലെങ്കിൽ ജി.എൻ.എം യോഗ്യതയും കേരള നഴ്സസ് ആൻഡ് മിഡ്‌വൈവ്സ് കൗൺസിൽ രജിസ്ട്രേഷനും വേണം.",
      "ഒറ്റ OMR പരീക്ഷയാണ് — 100 ചോദ്യങ്ങൾ, 100 മാർക്ക്. അതിനുശേഷം ഷോർട്ട്ലിസ്റ്റ്, രേഖാപരിശോധന, ഇന്റർവ്യൂ എന്നിവയുണ്ട്.",
    ],
    level: "Technical — B.Sc Nursing / GNM",
    totalMarks: 100,
    duration: "1 hour 30 minutes",
    durationNote:
      "469/2024 പരീക്ഷയ്ക്ക് 90 മിനിറ്റ് എന്നാണ് റിപ്പോർട്ട് ചെയ്യുന്നത്, പക്ഷേ സ്രോതസ്സുകൾ തമ്മിൽ അഭിപ്രായവ്യത്യാസമുണ്ട് — ചിലത് 75 മിനിറ്റ് എന്ന് പറയുന്നു. നിങ്ങളുടെ കാറ്റഗറിയുടെ വിജ്ഞാപനത്തിൽ സമയം ഉറപ്പുവരുത്തുക.",
    medium: "English",
    negativeMarking: "ഓരോ തെറ്റായ ഉത്തരത്തിനും 0.33 മാർക്ക് കുറയും",
    syllabusStatus: "official",
    statusNote:
      "ഔദ്യോഗിക സിലബസ് — കാറ്റഗറി 469/2024 പരീക്ഷ 2025 ജൂലൈ 18-ന് നടന്നു; ഷോർട്ട്ലിസ്റ്റ് 2025 നവംബർ 19-ന് പ്രസിദ്ധീകരിച്ചു",
    officialPdfUrl:
      "https://www.keralapsc.gov.in/sites/default/files/inline-files/Staff%20Nurse%20Gr-II.pdf",
    sections: [
      {
        section:
          "Behavioural Sciences — Anatomy & Physiology; Microbiology",
        marks: 10,
      },
      {
        section: "Behavioural Sciences — Psychology; Sociology",
        marks: 10,
      },
      {
        section:
          "Fundamentals of Nursing (incl. First Aid, Clinical Pharmacology)",
        marks: 10,
      },
      {
        section: "Community Health Nursing (incl. Nutrition)",
        marks: 10,
      },
      { section: "Medical Surgical Nursing", marks: 10 },
      { section: "Mental Health Nursing", marks: 10 },
      { section: "Child Health Nursing", marks: 10 },
      { section: "Midwifery and Gynaecological Nursing", marks: 10 },
      {
        section: "Nursing Education & Introduction to Research",
        marks: 10,
      },
      {
        section:
          "Professional Trends and Adjustment & Nursing Administration and Ward Management",
        marks: 10,
      },
    ],
    marksNote:
      "മുഴുവൻ 100 മാർക്കും നഴ്സിങ് വിഷയങ്ങളാണ് — പൊതുവിജ്ഞാനം, കറന്റ് അഫയേഴ്സ്, ഇംഗ്ലീഷ്, മാനസിക ശേഷി, മലയാളം എന്നീ വിഭാഗങ്ങൾ ഈ സിലബസിൽ ഇല്ല. ചില വെബ്സൈറ്റുകൾ അങ്ങനെ കാണിക്കുന്നത് ഔദ്യോഗിക സിലബസിന് വിരുദ്ധമാണ്; മുകളിലെ പട്ടിക ഔദ്യോഗിക സിലബസ് പ്രകാരമാണ്.",
    faqs: [
      {
        q: "സ്റ്റാഫ് നഴ്സ് പരീക്ഷയുടെ ആകെ മാർക്ക് എത്രയാണ്?",
        a: "100 മാർക്ക് — 100 ചോദ്യങ്ങൾ. പത്ത് മൊഡ്യൂളുകൾ, ഓരോന്നിനും 10 മാർക്ക് വീതം.",
      },
      {
        q: "പരീക്ഷയിൽ പൊതുവിജ്ഞാനം ഉണ്ടോ?",
        a: "ഇല്ല. മുഴുവൻ 100 മാർക്കും നഴ്സിങ് വിഷയങ്ങളാണ്. പൊതുവിജ്ഞാനമോ കറന്റ് അഫയേഴ്സോ ഇംഗ്ലീഷോ മാനസിക ശേഷിയോ ഈ സിലബസിൽ ഇല്ല — ഔദ്യോഗിക സിലബസ് പ്രകാരമാണ് ഇത്.",
      },
      {
        q: "ഏറ്റവും കൂടുതൽ ശ്രദ്ധ കൊടുക്കേണ്ട മൊഡ്യൂൾ ഏതാണ്?",
        a: "എല്ലാ മൊഡ്യൂളിനും 10 മാർക്ക് വീതമാണ്, അതുകൊണ്ട് ഒന്നും ഒഴിവാക്കരുത്. മെഡിക്കൽ സർജിക്കൽ നഴ്സിങ്, കമ്യൂണിറ്റി ഹെൽത്ത് നഴ്സിങ്, ഫണ്ടമെന്റൽസ് ഓഫ് നഴ്സിങ് എന്നിവയാണ് വിശാലമായ മൊഡ്യൂളുകൾ.",
      },
      {
        q: "നെഗറ്റീവ് മാർക്കിങ് ഉണ്ടോ?",
        a: "അതെ. ഓരോ തെറ്റായ ഉത്തരത്തിനും 0.33 മാർക്ക് കുറയ്ക്കും; ഉത്തരം എഴുതാത്ത ചോദ്യങ്ങൾക്ക് മാർക്ക് കുറയില്ല.",
      },
      {
        q: "469/2024 കാറ്റഗറിയുടെ നില എന്താണ്?",
        a: "പരീക്ഷ 2025 ജൂലൈ 18-ന് നടന്നു; ഷോർട്ട്ലിസ്റ്റ് 2025 നവംബർ 19-ന് പ്രസിദ്ധീകരിച്ചു. അതിനുശേഷം രേഖാപരിശോധനയും ഇന്റർവ്യൂവുമാണ് — ഇന്റർവ്യൂ മാർക്കിന്റെ ഭാരം ഔദ്യോഗികമായി സ്ഥിരീകരിച്ചിട്ടില്ല.",
      },
      {
        q: "പരീക്ഷയ്ക്ക് എന്ത് യോഗ്യതയാണ് വേണ്ടത്?",
        a: "പ്ലസ് ടു (സയൻസ്) + ബി.എസ്‌സി നഴ്സിങ് അല്ലെങ്കിൽ കുറഞ്ഞത് 3 വർഷത്തെ ജി.എൻ.എം, കൂടാതെ കേരള നഴ്സസ് ആൻഡ് മിഡ്‌വൈവ്സ് കൗൺസിൽ രജിസ്ട്രേഷനും വേണം.",
      },
    ],
  },
};

export const EXAM_SYLLABUS_SLUGS = Object.keys(EXAM_SYLLABI);
