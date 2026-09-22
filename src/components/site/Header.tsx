import Link from "next/link";
import { getAllCategories } from "@/lib/posts";
import SearchBox from "@/components/site/SearchBox";
import NavLinks from "@/components/site/NavLinks";

const PRIMARY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/current-affairs", label: "Current Affairs" },
  { href: "/quiz", label: "Quiz" },
  { href: "/mock-tests", label: "Mock Tests" },
  { href: "/pyqs", label: "PYQ Papers" },
  { href: "/syllabus", label: "Syllabus" },
  { href: "/psc-updates", label: "PSC Updates" },
];

export default async function Header() {
  const categories = await getAllCategories();
  const categoryLinks = categories.map((c) => ({
    href: `/category/${c.slug}`,
    label: c.name,
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-extrabold text-white shadow-sm shadow-indigo-600/30">
            PC
          </span>
          <span className="hidden text-xl font-extrabold tracking-tight text-slate-900 sm:inline">
            PSC<span className="text-indigo-600">Current</span>Affairs
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLinks links={PRIMARY_LINKS} />
        </nav>

        <SearchBox className="max-w-[10rem] sm:max-w-xs" />
      </div>

      <div className="scrollbar-hide flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-1.5 md:hidden">
        <NavLinks links={[...PRIMARY_LINKS, ...categoryLinks]} mobile />
      </div>
    </header>
  );
}
