import { login } from "@/lib/actions/auth";
import { ShieldCheck } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-600/30">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-white">
          Admin Login
        </h1>
        <p className="mt-1 text-center text-sm text-slate-400">
          PSC Current Affairs · staff only
        </p>

        {error && (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {decodeURIComponent(error)}
          </p>
        )}

        <form action={login} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">
          Admin accounts are created from the Supabase dashboard.
        </p>
      </div>
    </div>
  );
}
