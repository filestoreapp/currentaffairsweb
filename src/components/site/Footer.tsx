export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          <div>
            <p className="text-lg font-bold text-slate-900">
              PSC Current Affairs
            </p>
            <p className="mt-2 max-w-sm">
              Daily Kerala PSC current affairs, updates and study notes to
              help you crack your government job exam.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Join us</p>
            <p className="mt-2">Telegram channel coming soon 🚀</p>
          </div>
        </div>
        <p className="mt-8 border-t border-slate-200 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} PSC Current Affairs. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
