import Link from "next/link";
import {
  getMockBySlug,
  getMockLeaderboard,
  getPublishedMocks,
} from "@/lib/quizzes";
import { notFound } from "next/navigation";
import MockTestPlayer from "@/components/site/MockTestPlayer";
import { quizJsonLd, quizPageMetadata, siteUrl } from "@/lib/seo";
import {
  mockMalayalamDescription,
  mockMalayalamTitle,
  mockSyllabusPattern,
  resolveMockExam,
} from "@/lib/mock-landing";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ListChecks,
  Medal,
  MinusCircle,
  Play,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mock = await getMockBySlug(slug);
  if (!mock) return { title: "മോക്ക് ടെസ്റ്റ്" };
  const count = mock.questions?.length ?? 0;
  const minutes = mock.time_limit_seconds
    ? Math.round(mock.time_limit_seconds / 60)
    : null;
  const title = `${mockMalayalamTitle(mock)} — സൗജന്യ മോക്ക് ടെസ്റ്റ്`;
  return quizPageMetadata({
    title,
    description: mockMalayalamDescription(mock, count, minutes),
    url: `${siteUrl()}/mock-tests/${mock.slug}`,
  });
}

export default async function MockTestLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mock = await getMockBySlug(slug);

  if (!mock) notFound();

  const [leaderboard, allMocks] = await Promise.all([
    getMockLeaderboard(mock.id),
    getPublishedMocks(),
  ]);

  const questions = mock.questions ?? [];
  const count = questions.length;
  const minutes = mock.time_limit_seconds
    ? Math.round(mock.time_limit_seconds / 60)
    : null;
  const negMark = Number(mock.negative_marking ?? 0);
  const exam = resolveMockExam(mock);
  const syllabus = mockSyllabusPattern(mock);
  const titleMl = mockMalayalamTitle(mock);
  const attempts =
    allMocks.find((m) => m.id === mock.id)?.attempt_count ?? 0;
  const related = allMocks
    .filter(
      (m) => m.id !== mock.id && resolveMockExam(m).key === exam.key
    )
    .slice(0, 4);

  const faqs = [
    {
      q: "ഈ മോക്ക് ടെസ്റ്റ് സൗജന്യമാണോ?",
      a: "അതെ, പൂർണ്ണമായും സൗജന്യമാണ്. ലോഗിൻ ചെയ്യേണ്ടതില്ല — പേര് നൽകി ഉടൻ ടെസ്റ്റ് തുടങ്ങാം.",
    },
    {
      q: "നെഗറ്റീവ് മാർക്കിങ് ഉണ്ടോ?",
      a:
        negMark > 0
          ? `അതെ, ഓരോ തെറ്റായ ഉത്തരത്തിനും ${negMark} മാർക്ക് കുറയും. ഒഴിവാക്കിയ ചോദ്യങ്ങൾക്ക് മാർക്ക് കുറയില്ല.`
          : "ഇല്ല, തെറ്റായ ഉത്തരങ്ങൾക്ക് മാർക്ക് കുറയില്ല. ഒഴിവാക്കിയ ചോദ്യങ്ങൾക്ക് 0 മാർക്കാണ്.",
    },
    {
      q: "ടെസ്റ്റ് എത്ര സമയമെടുക്കും?",
      a: minutes
        ? `${minutes} മിനിറ്റാണ് സമയപരിധി. സമയം തീർന്നാൽ ടെസ്റ്റ് സ്വയം സമർപ്പിക്കപ്പെടും — അതുകൊണ്ട് സമയം നോക്കി എഴുതുക.`
        : "ഈ ടെസ്റ്റിന് സമയപരിധി നിശ്ചയിച്ചിട്ടില്ല. നിങ്ങളുടെ വേഗത്തിൽ എഴുതാം.",
    },
    {
      q: "ഉത്തരങ്ങൾ എപ്പോൾ കാണാം?",
      a: "ടെസ്റ്റ് സമർപ്പിച്ച ഉടൻ സ്കോറും ശരി/തെറ്റായ ഉത്തരങ്ങളുടെ വിശകലനവും ലീഡർബോർഡിലെ നിങ്ങളുടെ റാങ്കും കാണാം.",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            quizJsonLd(mock, `${siteUrl()}/mock-tests/${mock.slug}`)
          ),
        }}
      />

      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          മോക്ക് ടെസ്റ്റ് • {exam.malayalamFull}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {titleMl}
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-400">
          {mock.title}
        </p>
        <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
          {exam.malayalamFull} പരീക്ഷയ്ക്ക് തയ്യാറെടുക്കുന്നവർക്കുള്ള
          സൗജന്യ മോക്ക് ടെസ്റ്റാണ് ഇത്. {count} ചോദ്യങ്ങളാണ് ഉള്ളത്
          {minutes ? `; ${minutes} മിനിറ്റിനുള്ളിൽ പൂർത്തിയാക്കണം` : ""}.
          ഓരോ ശരിയുത്തരത്തിനും 1 മാർക്ക്
          {negMark > 0
            ? `, തെറ്റായ ഉത്തരത്തിന് ${negMark} മാർക്ക് കുറയും`
            : ", തെറ്റായ ഉത്തരത്തിന് മാർക്ക് കുറയില്ല"}
          . പരീക്ഷാ ഹാളിലെ അനുഭവം തന്നെ — ടൈമറും ലീഡർബോർഡും
          സഹിതം.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <ListChecks size={18} className="mx-auto text-indigo-600" />
            <p className="mt-2 text-xl font-extrabold text-slate-900">
              {count}
            </p>
            <p className="text-xs font-medium text-slate-500">ചോദ്യങ്ങൾ</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <Clock size={18} className="mx-auto text-indigo-600" />
            <p className="mt-2 text-xl font-extrabold text-slate-900">
              {minutes ? `${minutes} മിനിറ്റ്` : "—"}
            </p>
            <p className="text-xs font-medium text-slate-500">സമയം</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <Target size={18} className="mx-auto text-indigo-600" />
            <p className="mt-2 text-xl font-extrabold text-slate-900">
              {count}
            </p>
            <p className="text-xs font-medium text-slate-500">ആകെ മാർക്ക്</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <MinusCircle size={18} className="mx-auto text-indigo-600" />
            <p className="mt-2 text-xl font-extrabold text-slate-900">
              {negMark > 0 ? `−${negMark}` : "ഇല്ല"}
            </p>
            <p className="text-xs font-medium text-slate-500">
              നെഗറ്റീവ് മാർക്ക്
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <Users size={18} className="mx-auto text-indigo-600" />
            <p className="mt-2 text-xl font-extrabold text-slate-900">
              {attempts}
            </p>
            <p className="text-xs font-medium text-slate-500">ശ്രമങ്ങൾ</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <a
            href="#start-test"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
          >
            <Play size={18} />
            ടെസ്റ്റ് തുടങ്ങൂ
          </a>
          <p className="text-sm text-slate-500">
            സൗജന്യം • ലോഗിൻ വേണ്ട • ഫലം ഉടൻ കാണാം
          </p>
        </div>

        {syllabus && (
          <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <BookOpen size={20} className="text-indigo-600" />
              {syllabus.isPrelims ? "പ്രിലിമിനറി പരീക്ഷാ പാറ്റേൺ" : "പരീക്ഷാ പാറ്റേൺ"} —{" "}
              {exam.malayalamFull}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              ഈ പരീക്ഷയുടെ സിലബസ് അനുസരിച്ചുള്ള വിഭാഗവും മാർക്കും.
            </p>
            <ol className="mt-4 space-y-2">
              {syllabus.sections.map((s) => (
                <li
                  key={s.section}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm"
                >
                  <span className="font-medium text-slate-700">
                    {s.section}
                  </span>
                  <span className="font-bold text-indigo-600">
                    {s.marks} മാർക്ക്
                  </span>
                </li>
              ))}
            </ol>
            {syllabus.pattern.syllabusStatus === "expected" && (
              <p className="mt-3 text-xs text-slate-400">
                പ്രതീക്ഷിത സിലബസ് — ഔദ്യോഗിക സിലബസ് പ്രഖ്യാപിക്കുമ്പോൾ
                പുതുക്കും.
              </p>
            )}
            {exam.syllabusSlug && (
              <Link
                href={`/exams/${exam.syllabusSlug}/syllabus`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800"
              >
                മുഴുവൻ സിലബസും കാണൂ
                <ArrowRight size={15} />
              </Link>
            )}
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-lg font-extrabold text-slate-900">
            ടെസ്റ്റ് എങ്ങനെ എഴുതാം?
          </h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "പേര് നൽകൂ",
                body: "ലീഡർബോർഡിൽ കാണിക്കാനുള്ള പേര് നൽകുക. ലോഗിൻ ആവശ്യമില്ല.",
              },
              {
                title: "ടൈമറിൽ എഴുതൂ",
                body: "ചോദ്യങ്ങൾ ഓരോന്നായി ഉത്തരം നൽകൂ; സംശയമുള്ളവ അടയാളപ്പെടുത്തി പിന്നീട് നോക്കാം.",
              },
              {
                title: "സ്കോറും റാങ്കും കാണൂ",
                body: "സമർപ്പിച്ച ഉടൻ സ്കോറും ശരി/തെറ്റ് വിശകലനവും ലീഡർബോർഡ് റാങ്കും ലഭിക്കും.",
              },
            ].map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-extrabold text-indigo-700">
                  {i + 1}
                </span>
                <p className="mt-3 font-bold text-slate-900">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {mock.instructions && (
          <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-extrabold text-amber-900">
              നിർദ്ദേശങ്ങൾ
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-amber-800">
              {mock.instructions}
            </p>
          </section>
        )}

        {leaderboard.length > 0 && (
          <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <Trophy size={20} className="text-amber-500" />
              ഈ ടെസ്റ്റിലെ മികച്ച സ്കോറുകൾ
            </h2>
            <ol className="mt-4 space-y-2">
              {leaderboard.slice(0, 5).map((entry, i) => (
                <li
                  key={entry.id + i}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm"
                >
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <Medal
                      size={16}
                      className={
                        i === 0
                          ? "text-amber-500"
                          : i === 1
                            ? "text-slate-400"
                            : i === 2
                              ? "text-amber-700"
                              : "text-slate-300"
                      }
                    />
                    {i + 1}. {entry.name}
                  </span>
                  <span className="font-semibold text-indigo-600">
                    {entry.score} / {entry.total}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-slate-500">
              നിങ്ങളുടെ പേര് ഈ പട്ടികയിൽ കാണണോ? താഴെ ടെസ്റ്റ് എഴുതൂ.
            </p>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-lg font-extrabold text-slate-900">
            പതിവ് ചോദ്യങ്ങൾ
          </h2>
          <div className="mt-4 space-y-3">
            {faqs.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <p className="flex items-start gap-2 font-bold text-slate-900">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-indigo-600"
                  />
                  {f.q}
                </p>
                <p className="mt-1.5 pl-6 text-sm leading-relaxed text-slate-600">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-extrabold text-slate-900">
              ഇതേ പരീക്ഷയുടെ മറ്റ് മോക്ക് ടെസ്റ്റുകൾ
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((m) => {
                const mMinutes = m.time_limit_seconds
                  ? Math.round(m.time_limit_seconds / 60)
                  : null;
                return (
                  <Link
                    key={m.id}
                    href={`/mock-tests/${m.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow"
                  >
                    <span>
                      <span className="block font-bold text-slate-900">
                        {mockMalayalamTitle(m)}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {mMinutes ? `${mMinutes} മിനിറ്റ്` : ""}
                        {mMinutes && Number(m.negative_marking) > 0
                          ? ` • −${Number(m.negative_marking)} നെഗറ്റീവ്`
                          : ""}
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      className="shrink-0 text-slate-400"
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section id="start-test" className="mt-12 scroll-mt-20">
          <h2 className="text-lg font-extrabold text-slate-900">
            {titleMl} — ടെസ്റ്റ്
          </h2>
          <div className="mt-4">
            <MockTestPlayer quiz={mock} initialLeaderboard={leaderboard} />
          </div>
          <p className="mt-4 text-center text-sm">
            <Link
              href="/mock-tests"
              className="font-semibold text-indigo-600 hover:text-indigo-800"
            >
              ← എല്ലാ മോക്ക് ടെസ്റ്റുകളും കാണൂ
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
