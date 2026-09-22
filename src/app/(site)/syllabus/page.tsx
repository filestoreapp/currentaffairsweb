import SyllabusTracker from "@/components/site/SyllabusTracker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerala PSC Syllabus Tracker",
  description:
    "Track your Kerala PSC syllabus coverage topic by topic — tick off what you've mastered and watch your progress grow.",
};

export default function SyllabusPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Syllabus Tracker</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        The Kerala PSC syllabus, broken into checkable topics. Tick off each
        topic as you master it — your progress is saved on this device, no
        login needed.
      </p>
      <SyllabusTracker />
    </div>
  );
}
