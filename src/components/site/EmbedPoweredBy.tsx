import Link from "next/link";

/**
 * The backlink every embed carries — visible, and the whole point of the
 * embed program: any site that pastes our widget links back to us.
 */
export default function EmbedPoweredBy({ href }: { href: string }) {
  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3 text-center text-sm">
      <Link
        href={href}
        target="_blank"
        rel="noopener"
        className="font-semibold text-indigo-700 hover:text-indigo-900"
      >
        Powered by Kerala PSC Current Affairs
      </Link>
      <span className="text-slate-400"> — psccurrentaffairs.online</span>
    </div>
  );
}
