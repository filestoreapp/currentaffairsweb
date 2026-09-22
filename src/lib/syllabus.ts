/**
 * Kerala PSC common preliminary syllabus (degree-level pattern), as a
 * static checklist. Topics are the standard areas PSC repeats across
 * exams — tick them off as you master each one. Progress is stored in
 * the browser (localStorage), no account needed.
 */

export interface SyllabusTopic {
  id: string;
  title: string;
  items: string[];
}

export interface SyllabusSection {
  id: string;
  title: string;
  titleMl?: string;
  description: string;
  topics: SyllabusTopic[];
}

export const SYLLABUS: SyllabusSection[] = [
  {
    id: "general-knowledge",
    title: "General Knowledge",
    titleMl: "പൊതുവിജ്ഞാനം",
    description: "History, geography, polity, economy and science — the core of every PSC paper.",
    topics: [
      {
        id: "gk-history",
        title: "Indian History",
        items: [
          "Indus Valley Civilization & Vedic period",
          "Mauryan, Gupta empires & Sangam age",
          "Medieval India — Sultanate & Mughals",
          "Freedom struggle 1857–1947",
          "Kerala history — kingdoms, Mysorean invasion, social reformers",
        ],
      },
      {
        id: "gk-geography",
        title: "Geography",
        items: [
          "Physical geography of India — rivers, mountains, soils",
          "Kerala geography — districts, rivers, backwaters, Western Ghats",
          "Climate, monsoons & agriculture",
          "World geography — continents, oceans, important lines",
        ],
      },
      {
        id: "gk-polity",
        title: "Indian Polity",
        items: [
          "Constitution — preamble, fundamental rights & duties",
          "Parliament, President, PM & judiciary",
          "Federal structure & local self-government (Panchayati Raj)",
          "Kerala administrative setup",
        ],
      },
      {
        id: "gk-economy",
        title: "Economics",
        items: [
          "Basic economic concepts — GDP, inflation, budgets",
          "Five-year plans & NITI Aayog",
          "Banking, RBI & financial institutions",
          "Kerala economy — key sectors & schemes",
        ],
      },
      {
        id: "gk-science",
        title: "General Science",
        items: [
          "Physics — motion, light, electricity basics",
          "Chemistry — elements, acids, everyday chemistry",
          "Biology — human body, diseases, nutrition",
          "Environment, ecology & recent science news",
        ],
      },
    ],
  },
  {
    id: "current-affairs",
    title: "Current Affairs",
    titleMl: "ആനുകാലികം",
    description: "National, international and Kerala-specific events of the last 6–12 months.",
    topics: [
      {
        id: "ca-national",
        title: "National Affairs",
        items: [
          "Government schemes & policies",
          "Awards, sports & appointments",
          "Science & technology developments",
          "Indian polity & governance updates",
        ],
      },
      {
        id: "ca-kerala",
        title: "Kerala Affairs",
        items: [
          "Kerala government schemes & projects",
          "Kerala Budget highlights",
          "Festivals, art forms & cultural news",
          "Kerala-specific rankings & reports",
        ],
      },
      {
        id: "ca-world",
        title: "International Affairs",
        items: [
          "Summits, treaties & organisations (UN, G20, BRICS)",
          "India's foreign relations",
          "Global awards & major events",
        ],
      },
    ],
  },
  {
    id: "renaissance",
    title: "Renaissance in Kerala",
    titleMl: "കേരള നവോത്ഥാനം",
    description: "Social reform movements and leaders — a high-weightage PSC favourite.",
    topics: [
      {
        id: "ren-leaders",
        title: "Reformers & Movements",
        items: [
          "Sree Narayana Guru & SNDP Yogam",
          "Chattampi Swamikal & Nair Service Society",
          "Ayyankali & Sadhujana Paripalana Sangham",
          "Vaikom & Guruvayur Satyagrahas",
          "Kumaran Asan, Vallathol & cultural renaissance",
        ],
      },
    ],
  },
  {
    id: "arithmetic",
    title: "Simple Arithmetic & Mental Ability",
    titleMl: "ഗണിതം",
    description: "Quantitative aptitude and reasoning asked in almost every PSC exam.",
    topics: [
      {
        id: "arith-basic",
        title: "Arithmetic",
        items: [
          "Number system, HCF & LCM",
          "Percentage, profit & loss, discount",
          "Simple & compound interest",
          "Time, speed, distance & work",
          "Averages, ratios & mixtures",
        ],
      },
      {
        id: "arith-reasoning",
        title: "Mental Ability",
        items: [
          "Series completion & coding-decoding",
          "Blood relations & direction sense",
          "Syllogisms & statement-conclusion",
          "Non-verbal reasoning basics",
        ],
      },
    ],
  },
  {
    id: "english",
    title: "General English",
    titleMl: "ഇംഗ്ലീഷ്",
    description: "Grammar and comprehension at the 10th/degree level.",
    topics: [
      {
        id: "eng-grammar",
        title: "Grammar",
        items: [
          "Tenses & subject-verb agreement",
          "Articles, prepositions & conjunctions",
          "Active/passive voice & reported speech",
          "Error spotting & sentence improvement",
          "Synonyms, antonyms & idioms",
        ],
      },
    ],
  },
  {
    id: "malayalam",
    title: "Malayalam",
    titleMl: "മലയാളം",
    description: "Malayalam grammar and literature for Kerala PSC papers.",
    topics: [
      {
        id: "mal-grammar",
        title: "Grammar & Literature",
        items: [
          "വ്യാകരണം — സന്ധി, സമാസം, വിഭക്തി",
          "പര്യായപദങ്ങൾ & വിപരീതപദങ്ങൾ",
          "സാഹിത്യം — പ്രധാന കൃതികളും കർത്താക്കളും",
          "പഴഞ്ചൊല്ലുകൾ & ശൈലികൾ",
        ],
      },
    ],
  },
];

export const SYLLABUS_STORAGE_KEY = "psc-syllabus-progress-v1";
