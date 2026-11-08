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
};

export const EXAM_SYLLABUS_SLUGS = Object.keys(EXAM_SYLLABI);
