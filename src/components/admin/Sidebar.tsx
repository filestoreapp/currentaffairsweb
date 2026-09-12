"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  PlusCircle,
  LogOut,
  Globe,
  ClipboardList,
  BarChart3,
  RefreshCw,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/posts/new", label: "New Post", icon: PlusCircle },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/quizzes", label: "Quizzes", icon: ClipboardList },
  { href: "/admin/psc-updates", label: "PSC Auto-Updates", icon: RefreshCw },
  { href: "/admin/statistics", label: "Statistics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-6 py-5">
        <p className="text-lg font-extrabold text-slate-900">
          PSC<span className="text-indigo-600">Admin</span>
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-100 px-3 py-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Globe size={18} />
          View site
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
