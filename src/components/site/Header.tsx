import Link from "next/link";
import { getAllCategories } from "@/lib/posts";
import SearchBox from "@/components/site/SearchBox";

export default async function Header() {
  const categories = await getAllCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-extrabold text-xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            PC
          </span>
          <span className="hidden text-slate-900 sm:inline">
            PSC<span className="text-indigo-600">Current</span>Affairs
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          <Link href="/" className="hover:text-indigo-600">
            Home
          </Link>
          <Link href="/current-affairs" className="hover:text-indigo-600">
            Current Affairs
          </Link>
          <Link href="/quiz" className="hover:text-indigo-600">
            Quiz
          </Link>
          <Link href="/mock-tests" className="hover:text-indigo-600">
            Mock Tests
          </Link>
          <Link href="/psc-updates" className="hover:text-indigo-600">
            PSC Updates
          </Link>
          {categories.slice(0, 3).map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="hover:text-indigo-600"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <SearchBox className="max-w-[10rem] sm:max-w-xs" />
      </div>

      <div className="scrollbar-hide flex gap-4 overflow-x-auto border-t border-slate-100 px-4 py-2 text-sm font-medium text-slate-600 md:hidden">
        <Link href="/" className="whitespace-nowrap hover:text-indigo-600">
          Home
        </Link>
        <Link href="/current-affairs" className="whitespace-nowrap hover:text-indigo-600">
          Current Affairs
        </Link>
        <Link href="/quiz" className="whitespace-nowrap hover:text-indigo-600">
          Quiz
        </Link>
        <Link href="/mock-tests" className="whitespace-nowrap hover:text-indigo-600">
          Mock Tests
        </Link>
        <Link href="/psc-updates" className="whitespace-nowrap hover:text-indigo-600">
          PSC Updates
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="whitespace-nowrap hover:text-indigo-600"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </header>
  );
}
