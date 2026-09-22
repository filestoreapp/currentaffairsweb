"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavLink {
  href: string;
  label: string;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavLinks({
  links,
  mobile = false,
}: {
  links: NavLink[];
  mobile?: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      {links.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href + label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              mobile
                ? `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                : `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
            }
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
