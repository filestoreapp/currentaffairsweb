/**
 * Upcoming Kerala PSC exams, seeded from the official examination
 * programmes (keralapsc.gov.in):
 *  - November 2026 programme (finalized after confirmation, 14.09.2026)
 *    — only exams from 14 Nov onward are listed; Nov 3–12 already held.
 *  - December 2026 programme (after confirmation, 15.10.2026).
 *  - January 2027 programme (released 27.10.2026).
 *
 * All prose fields are Malayalam. Times for January were not published
 * with the programme — those rows say so on the admit card.
 */

export type ConfirmationInfo =
  | { kind: "finalized" }
  | { kind: "open"; window: string }
  | { kind: "closed"; window: string }
  | { kind: "not-required" };

export interface UpcomingExam {
  /** ISO date (YYYY-MM-DD) of the exam; for multi-day exams, the first day. */
  date: string;
  /** Malayalam date label, e.g. "നവംബർ 17, ചൊവ്വ". */
  dateLabel: string;
  /** Malayalam time label, e.g. "രാവിലെ 7:00–8:50". Null when the
   *  programme does not publish a time (see the admit card). */
  time: string | null;
  /** Malayalam post name(s). */
  posts: string;
  /** Category number(s), e.g. "187/2025; 188/2025". */
  categories: string;
  /** Malayalam scope: "സംസ്ഥാനതലം", "ജില്ല തിരിച്ച്" or districts. */
  scope: string;
  confirmation: ConfirmationInfo;
  /** Malayalam admit-card availability, e.g. "നവംബർ 2 മുതൽ". */
  admitFrom: string;
  /** Highlighted group entry (common test covering many posts). */
  highlight?: boolean;
  /** Optional extra Malayalam note shown under the row. */
  note?: string;
}

export interface UpcomingMonth {
  id: string;
  /** Malayalam month title, e.g. "നവംബർ 2026". */
  title: string;
  /** Malayalam note shown under the month heading. */
  note?: string;
  exams: UpcomingExam[];
}

const NOVEMBER_FINALIZED: ConfirmationInfo = { kind: "finalized" };
const DECEMBER_CLOSED: ConfirmationInfo = {
  kind: "closed",
  window: "22/09–11/10/2026",
};
const JANUARY_OPEN: ConfirmationInfo = {
  kind: "open",
  window: "26/10–14/11/2026",
};
const NOT_REQUIRED: ConfirmationInfo = { kind: "not-required" };

export const UPCOMING_EXAM_MONTHS: UpcomingMonth[] = [
  {
    id: "november-2026",
    title: "നവംബർ 2026",
    note: "കൺഫർമേഷന് ശേഷം അന്തിമമാക്കിയ പദ്ധതി — കൺഫർമേഷൻ സമയപരിധി കഴിഞ്ഞു, അഡ്മിറ്റ് കാർഡുകൾ ഇതിനകം ലഭ്യമാണ്. നവംബർ 3–12 പരീക്ഷകൾ പൂർത്തിയായി; സിഡ്കോ ഫോർമാൻ (വുഡ് വർക്ക്ഷോപ്പ്) പരീക്ഷ (582/2025) റദ്ദാക്കി.",
    exams: [
      {
        date: "2026-11-17",
        dateLabel: "നവംബർ 17, ചൊവ്വ",
        time: "രാവിലെ 7:00–8:50",
        posts: "എക്സൈസ് ഇൻസ്പെക്ടർ (ട്രെയിനി) മെയിൻ പരീക്ഷ",
        categories: "187/2025; 188/2025",
        scope: "സംസ്ഥാനതലം",
        confirmation: NOVEMBER_FINALIZED,
        admitFrom: "നവംബർ 2 മുതൽ",
        highlight: true,
        note: "കോമൺ ടെസ്റ്റ് — ഡയറക്ട് റിക്രൂട്ട്മെന്റിൽ 28,156 പേരും ബൈ ട്രാൻസ്ഫറിൽ 394 പേരും. സെപ്റ്റംബർ 28-ന് നടക്കേണ്ടിയിരുന്നത് മാറ്റിവച്ചത്.",
      },
      {
        date: "2026-11-18",
        dateLabel: "നവംബർ 18, ബുധൻ",
        time: "രാവിലെ 7:00–8:50",
        posts: "ട്രേഡ്സ്മാൻ — ഇൻസ്ട്രുമെന്റ് ടെക്നോളജി",
        categories: "886/2025",
        scope: "സംസ്ഥാനതലം",
        confirmation: NOVEMBER_FINALIZED,
        admitFrom: "നവംബർ 3 മുതൽ",
      },
      {
        date: "2026-11-19",
        dateLabel: "നവംബർ 19, വ്യാഴം",
        time: "ബാച്ച് I രാവിലെ 8:00–11:00; ബാച്ച് II 10:45–1:45 (ഓൺലൈൻ)",
        posts: "പ്ലംബർ / പ്ലംബർ കം ഓപ്പറേറ്റർ; സീവിങ് ടീച്ചർ (ഹൈസ്കൂൾ)",
        categories: "783/2025; 561/2025, 595/2025, 596/2025",
        scope: "കണ്ണൂർ; ജില്ല തിരിച്ച്",
        confirmation: NOVEMBER_FINALIZED,
        admitFrom: "നവംബർ 4 മുതൽ",
        note: "സീവിങ് ടീച്ചർ ആഗസ്റ്റ് 19-ന് നടക്കേണ്ടിയിരുന്നത് മാറ്റിവച്ചത്; കോമൺ ടെസ്റ്റ്.",
      },
      {
        date: "2026-11-21",
        dateLabel: "നവംബർ 21, ശനി",
        time: "ഉച്ചയ്ക്ക് 1:30–3:20",
        posts: "ഇൻസ്പെക്ടിങ് അസിസ്റ്റന്റ്, ലീഗൽ മെട്രോളജി",
        categories: "647/2025; 883/2025",
        scope: "സംസ്ഥാനതലം",
        confirmation: NOVEMBER_FINALIZED,
        admitFrom: "നവംബർ 6 മുതൽ",
        note: "കോമൺ ടെസ്റ്റ് — ഡയറക്ട് റിക്രൂട്ട്മെന്റിൽ (883/2025) മാത്രം 1,88,405 പേർ. ആഗസ്റ്റ് 22-ന് നടക്കേണ്ടിയിരുന്നത് മാറ്റിവച്ചത്.",
      },
      {
        date: "2026-11-24",
        dateLabel: "നവംബർ 24, ചൊവ്വ",
        time: "രാവിലെ 9:00–12:00 (ഓൺലൈൻ)",
        posts: "അസിസ്റ്റന്റ് മാനേജർ; ടെക്നീഷ്യൻ ഗ്രേഡ് II (ഫിറ്റർ മെക്കാനിക്)",
        categories: "019/2026; 777/2025",
        scope: "സംസ്ഥാനതലം; എറണാകുളം, വയനാട്, കണ്ണൂർ",
        confirmation: NOVEMBER_FINALIZED,
        admitFrom: "നവംബർ 9 മുതൽ",
      },
      {
        date: "2026-11-25",
        dateLabel: "നവംബർ 25, ബുധൻ",
        time: "രാവിലെ 7:00–8:50",
        posts: "പോലീസ് കോൺസ്റ്റബിൾ ഡ്രൈവർ / വുമൺ പോലീസ് കോൺസ്റ്റബിൾ ഡ്രൈവർ",
        categories:
          "030/2026, 064/2026, 475/2025, 476/2025, 477/2025, 479/2025, 481/2025, 482/2025, 483/2025",
        scope: "സംസ്ഥാനതലം",
        confirmation: NOVEMBER_FINALIZED,
        admitFrom: "നവംബർ 10 മുതൽ",
        highlight: true,
        note: "കോമൺ ടെസ്റ്റ് — 030/2026 വിഭാഗത്തിൽ 16,091 പേർ.",
      },
      {
        date: "2026-11-26",
        dateLabel: "നവംബർ 26, വ്യാഴം",
        time: "രാവിലെ 9:00–12:00 (ഓൺലൈൻ)",
        posts: "അഗ്രികൾച്ചർ ഡെവലപ്മെന്റ് മെക്കാനിക്",
        categories: "778/2025",
        scope: "ആലപ്പുഴ, പാലക്കാട്, കോഴിക്കോട്, കാസർകോട്",
        confirmation: NOVEMBER_FINALIZED,
        admitFrom: "നവംബർ 11 മുതൽ",
        note: "കോമൺ ടെസ്റ്റ് — നാല് ജില്ലകളിലെ ഉദ്യോഗാർത്ഥികൾ ഒരേ പരീക്ഷ എഴുതുന്നു.",
      },
      {
        date: "2026-11-27",
        dateLabel: "നവംബർ 27, വെള്ളി",
        time: "രാവിലെ 7:00–8:50",
        posts: "ലബോറട്ടറി ടെക്നീഷ്യൻ ഗ്രേഡ് II; മോർച്ചറി ടെക്നീഷ്യൻ ഗ്രേഡ് II",
        categories:
          "206/2025, 337/2025, 338/2025, 391/2025, 392/2025, 558/2025, 729/2025, 730/2025, 059/2026",
        scope: "സംസ്ഥാനതലം; ജില്ല തിരിച്ച്",
        confirmation: NOVEMBER_FINALIZED,
        admitFrom: "നവംബർ 12 മുതൽ",
        highlight: true,
        note: "കോമൺ ടെസ്റ്റ് — ആയുർവേദ, ആരോഗ്യ, ഹോമിയോപ്പതി വകുപ്പുകളിലെ ഒൻപത് കാറ്റഗറികൾ.",
      },
    ],
  },
  {
    id: "december-2026",
    title: "ഡിസംബർ 2026",
    note: "63 തസ്തികകളിലായി 89 പരീക്ഷകൾ. കൺഫർമേഷൻ സമയപരിധി 22/09–11/10/2026 അവസാനിച്ചു — കൺഫർമേഷൻ നൽകാത്തവർക്ക് അഡ്മിറ്റ് കാർഡ് ലഭിക്കില്ല.",
    exams: [
      {
        date: "2026-12-01",
        dateLabel: "ഡിസംബർ 1, ചൊവ്വ",
        time: "രാവിലെ 7:00–8:50",
        posts: "ജൂനിയർ അസിസ്റ്റന്റ്",
        categories: "020/2026",
        scope: "സംസ്ഥാനതലം",
        confirmation: DECEMBER_CLOSED,
        admitFrom: "നവംബർ 16 മുതൽ",
      },
      {
        date: "2026-12-02",
        dateLabel: "ഡിസംബർ 2, ബുധൻ",
        time: "രാവിലെ 9:00–12:00 (ഓൺലൈൻ)",
        posts: "ജിയോളജിക്കൽ അസിസ്റ്റന്റ്; ഡെപ്യൂട്ടി മാനേജർ (ഫിനാൻസ്)",
        categories: "046/2026; 080/2026",
        scope: "സംസ്ഥാനതലം",
        confirmation: DECEMBER_CLOSED,
        admitFrom: "നവംബർ 17 മുതൽ",
      },
      {
        date: "2026-12-05",
        dateLabel: "ഡിസംബർ 5, ശനി",
        time: "രാവിലെ 10:30–12:20",
        posts:
          "മെയിൻ പരീക്ഷ — ജൂനിയർ അസിസ്റ്റന്റ്/അസിസ്റ്റന്റ് ഗ്രേഡ് II, സൂപ്പർവൈസർ, ജൂനിയർ അസിസ്റ്റന്റ്/കാഷ്യർ",
        categories: "383/2025; 463/2025; 573/2025",
        scope: "സംസ്ഥാനതലം",
        confirmation: NOT_REQUIRED,
        admitFrom: "നവംബർ 19 മുതൽ",
      },
      {
        date: "2026-12-08",
        dateLabel: "ഡിസംബർ 8, ചൊവ്വ",
        time: "രാവിലെ 7:00–8:50",
        posts: "അസിസ്റ്റന്റ് മെയിൻ പരീക്ഷ",
        categories: "269/2025",
        scope: "സംസ്ഥാനതലം",
        confirmation: NOT_REQUIRED,
        admitFrom: "നവംബർ 23 മുതൽ",
      },
      {
        date: "2026-12-09",
        dateLabel: "ഡിസംബർ 9, ബുധൻ",
        time: "രാവിലെ 7:00–8:50",
        posts: "ചൈൽഡ് ഡെവലപ്മെന്റ് പ്രോജക്ട് ഓഫീസർ",
        categories: "025/2026",
        scope: "സംസ്ഥാനതലം",
        confirmation: DECEMBER_CLOSED,
        admitFrom: "നവംബർ 24 മുതൽ",
      },
      {
        date: "2026-12-10",
        dateLabel: "ഡിസംബർ 10, വ്യാഴം",
        time: "രാവിലെ 7:00–8:50",
        posts: "പട്ടികജാതി വികസന ഓഫീസർ ഗ്രേഡ് II",
        categories: "027/2026",
        scope: "സംസ്ഥാനതലം",
        confirmation: DECEMBER_CLOSED,
        admitFrom: "നവംബർ 25 മുതൽ",
      },
      {
        date: "2026-12-11",
        dateLabel: "ഡിസംബർ 11, വെള്ളി",
        time: "രാവിലെ 7:00–8:50",
        posts:
          "കോമൺ ടെസ്റ്റ് — എൽ.ഡി ടൈപ്പിസ്റ്റ്, കമ്പ്യൂട്ടർ അസിസ്റ്റന്റ്, ടൈപ്പിസ്റ്റ് തുടങ്ങി 58 തസ്തികകൾ",
        categories:
          "631/2025, 744/2025, 760/2025, 032/2026, 050/2026, 084/2026, 085/2026, 003/2026 തുടങ്ങിയവ",
        scope: "സംസ്ഥാനതലം; ജില്ല തിരിച്ച്",
        confirmation: DECEMBER_CLOSED,
        admitFrom: "നവംബർ 26 മുതൽ",
        highlight: true,
        note: "മാസത്തെ ഏറ്റവും വലിയ പരീക്ഷ — ലോവർ ഡിവിഷൻ ടൈപ്പിസ്റ്റ്, ടൈപ്പിസ്റ്റ് ഗ്രേഡ് II, കമ്പ്യൂട്ടർ അസിസ്റ്റന്റ് ഗ്രേഡ് II, കോൺഫിഡൻഷ്യൽ അസിസ്റ്റന്റ്, സ്റ്റെനോഗ്രാഫർ, ക്ലാർക്ക് ടൈപ്പിസ്റ്റ്, എക്സിക്യൂട്ടീവ് അസിസ്റ്റന്റ് തുടങ്ങിയവ. ഒന്നിലധികം കാറ്റഗറികൾക്ക് അപേക്ഷിച്ചവർ ഒരു പരീക്ഷ മാത്രം എഴുതിയാൽ മതി.",
      },
      {
        date: "2026-12-15",
        dateLabel: "ഡിസംബർ 15, ചൊവ്വ",
        time: "രാവിലെ 7:00–8:50",
        posts: "ഇലക്ട്രീഷ്യൻ ഗ്രേഡ് II; ഡയറി എക്സ്റ്റൻഷൻ ഓഫീസർ",
        categories: "771/2025; 023/2026",
        scope: "എറണാകുളം, കോഴിക്കോട്; സംസ്ഥാനതലം",
        confirmation: DECEMBER_CLOSED,
        admitFrom: "നവംബർ 30 മുതൽ",
      },
      {
        date: "2026-12-16",
        dateLabel: "ഡിസംബർ 16, ബുധൻ",
        time: "രാവിലെ 7:00–8:50",
        posts: "ഡ്രൈവർ ഗ്രേഡ് II, ഫോറസ്റ്റ് ഡ്രൈവർ തുടങ്ങിയവ",
        categories:
          "172/2025, 173/2025, 258/2025, 259/2025, 262/2025, 263/2025, 406/2025, 407/2025, 424/2025, 425/2025, 787/2025, 861/2025, 126/2026",
        scope: "ജില്ല തിരിച്ച്",
        confirmation: DECEMBER_CLOSED,
        admitFrom: "ഡിസംബർ 1 മുതൽ",
        note: "കോമൺ ടെസ്റ്റ് — 13 കാറ്റഗറികളിലെ ഡ്രൈവർ തസ്തികകൾ.",
      },
      {
        date: "2026-12-17",
        dateLabel: "ഡിസംബർ 17, വ്യാഴം",
        time: "ബാച്ച് I രാവിലെ 8:00–11:00; ബാച്ച് II 10:45–1:45 (ഓൺലൈൻ)",
        posts:
          "ട്രേഡ്സ്മാൻ (കമ്പ്യൂട്ടർ ഹാർഡ്‌വെയർ); അസിസ്റ്റന്റ് മാനേജർ (പ്രൊഡക്ഷൻ) ഗ്രേഡ് II",
        categories: "884/2025; 024/2026",
        scope: "സംസ്ഥാനതലം",
        confirmation: DECEMBER_CLOSED,
        admitFrom: "ഡിസംബർ 2 മുതൽ",
      },
      {
        date: "2026-12-19",
        dateLabel: "ഡിസംബർ 19, ശനി",
        time: "രാവിലെ 10:30–12:20",
        posts: "ജൂനിയർ അസിസ്റ്റന്റ്/കാഷ്യർ മെയിൻ പരീക്ഷ",
        categories: "382/2025",
        scope: "സംസ്ഥാനതലം",
        confirmation: NOT_REQUIRED,
        admitFrom: "ഡിസംബർ 4 മുതൽ",
      },
      {
        date: "2026-12-21",
        dateLabel: "ഡിസംബർ 21–22, തിങ്കൾ–ചൊവ്വ",
        time: "പേപ്പർ I, II ഡിസംബർ 21; പേപ്പർ III ഡിസംബർ 22",
        posts: "ഡിവിഷണൽ അക്കൗണ്ട്സ് ഓഫീസർ മെയിൻ പരീക്ഷ (വിവരണാത്മകം)",
        categories: "220/2025; 472/2025",
        scope: "സംസ്ഥാനതലം",
        confirmation: NOT_REQUIRED,
        admitFrom: "ഡിസംബർ 5 മുതൽ",
        note: "പേപ്പർ I ഡിസംബർ 21 രാവിലെ 9:00–12:20; പേപ്പർ II ഡിസംബർ 21 ഉച്ചയ്ക്ക് 1:30–4:50; പേപ്പർ III ഡിസംബർ 22 രാവിലെ 9:00–12:20.",
      },
    ],
  },
  {
    id: "january-2027",
    title: "ജനുവരി 2027",
    note: "23 പരീക്ഷകൾ, ജനുവരി 12–30. കൺഫർമേഷൻ ആവശ്യമുള്ള തസ്തികകൾക്ക് സമയപരിധി 26/10–14/11/2026 — നവംബർ 14-ന് അവസാനിക്കുന്നു. മെയിൻ പരീക്ഷകൾക്ക് കൺഫർമേഷൻ ആവശ്യമില്ല.",
    exams: [
      {
        date: "2027-01-12",
        dateLabel: "ജനുവരി 12, ചൊവ്വ",
        time: null,
        posts: "അസിസ്റ്റന്റ് ഡയറക്ടർ ഓഫ് നാഷണൽ സേവിങ്സ് മെയിൻ പരീക്ഷ",
        categories: "698/2025, 699/2025, 700/2025",
        scope: "സംസ്ഥാനതലം",
        confirmation: NOT_REQUIRED,
        admitFrom: "ഡിസംബർ 28 മുതൽ",
      },
      {
        date: "2027-01-18",
        dateLabel: "ജനുവരി 18, തിങ്കൾ",
        time: null,
        posts: "റിപ്പോർട്ടർ ഗ്രേഡ് II (മലയാളം) — ഡിക്ടേഷൻ & ട്രാൻസ്ക്രിപ്ഷൻ ടെസ്റ്റ്",
        categories: "271/2025",
        scope: "സംസ്ഥാനതലം",
        confirmation: NOT_REQUIRED,
        admitFrom: "ജനുവരി 1 മുതൽ",
      },
      {
        date: "2027-01-20",
        dateLabel: "ജനുവരി 20, ബുധൻ",
        time: null,
        posts: "സ്റ്റേഷൻ ഓഫീസർ (ട്രെയിനി)",
        categories: "047/2026",
        scope: "സംസ്ഥാനതലം",
        confirmation: JANUARY_OPEN,
        admitFrom: "ജനുവരി 5 മുതൽ",
      },
      {
        date: "2027-01-21",
        dateLabel: "ജനുവരി 21, വ്യാഴം",
        time: null,
        posts: "അസിസ്റ്റന്റ് എൻജിനീയർ (ഇലക്ട്രിക്കൽ)",
        categories: "044/2026",
        scope: "സംസ്ഥാനതലം",
        confirmation: JANUARY_OPEN,
        admitFrom: "ജനുവരി 6 മുതൽ",
      },
      {
        date: "2027-01-22",
        dateLabel: "ജനുവരി 22, വെള്ളി",
        time: null,
        posts: "ജൂനിയർ ഇൻസ്ട്രക്ടർ (മെക്കാനിക് ട്രാക്ടർ)",
        categories: "078/2026",
        scope: "സംസ്ഥാനതലം",
        confirmation: JANUARY_OPEN,
        admitFrom: "ജനുവരി 7 മുതൽ",
      },
      {
        date: "2027-01-23",
        dateLabel: "ജനുവരി 23, ശനി",
        time: null,
        posts: "സബ് ഇൻസ്പെക്ടർ മെയിൻ പരീക്ഷ",
        categories: "221/2025, 446/2025, 447/2025, 448/2025, 449/2025, 450/2025",
        scope: "സംസ്ഥാനതലം",
        confirmation: NOT_REQUIRED,
        admitFrom: "ജനുവരി 8 മുതൽ",
      },
      {
        date: "2027-01-27",
        dateLabel: "ജനുവരി 27, ബുധൻ",
        time: null,
        posts: "ജൂനിയർ ക്ലാർക്ക്; അസിസ്റ്റന്റ്; ജൂനിയർ ക്ലാർക്ക്",
        categories: "403/2025, 832/2025, 090/2026",
        scope: "സംസ്ഥാനതലം",
        confirmation: JANUARY_OPEN,
        admitFrom: "ജനുവരി 12 മുതൽ",
      },
      {
        date: "2027-01-28",
        dateLabel: "ജനുവരി 28, വ്യാഴം",
        time: null,
        posts:
          "കാത്ത് ലാബ് ടെക്നീഷ്യൻ; സെക്രട്ടറി (എൽ.എസ്.ജി.ഐ); അസിസ്റ്റന്റ് പ്രൊഫസർ (ന്യൂറോ സർജറി); അസിസ്റ്റന്റ് എക്സിക്യൂട്ടീവ് എൻജിനീയർ",
        categories: "029/2026, 039/2026, 040/2026, 073/2026, 074/2026",
        scope: "സംസ്ഥാനതലം",
        confirmation: JANUARY_OPEN,
        admitFrom: "ജനുവരി 13 മുതൽ",
      },
      {
        date: "2027-01-29",
        dateLabel: "ജനുവരി 29, വെള്ളി",
        time: null,
        posts: "ഫിഷറീസ് എക്സ്റ്റൻഷൻ ഓഫീസർ",
        categories: "045/2026",
        scope: "സംസ്ഥാനതലം",
        confirmation: JANUARY_OPEN,
        admitFrom: "ജനുവരി 14 മുതൽ",
      },
      {
        date: "2027-01-30",
        dateLabel: "ജനുവരി 30, ശനി",
        time: null,
        posts: "അസിസ്റ്റന്റ് (എസ്.ആർ — എസ്.ടി മാത്രം)",
        categories: "058/2026",
        scope: "സംസ്ഥാനതലം",
        confirmation: JANUARY_OPEN,
        admitFrom: "ജനുവരി 15 മുതൽ",
      },
    ],
  },
];

/** Flat list of all exams, in chronological order. */
export const ALL_UPCOMING_EXAMS: UpcomingExam[] = UPCOMING_EXAM_MONTHS.flatMap(
  (m) => m.exams
);
