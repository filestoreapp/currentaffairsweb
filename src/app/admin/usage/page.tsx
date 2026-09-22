import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import { Image as ImageIcon, Database, Globe, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

const IMAGE_REPO = "filestoreapp/images";
const DB_FREE_MB = 500;

function fmtBytes(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const mb = bytes / 1024 / 1024;
  return mb < 1024 ? `${mb.toFixed(1)} MB` : `${(mb / 1024).toFixed(2)} GB`;
}

function Bar({ pct, tone }: { pct: number; tone: string }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

async function getImageRepoUsage() {
  try {
    const res = await fetch(`https://api.github.com/repos/${IMAGE_REPO}`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 300 },
    });
    if (res.status === 404) return { missing: true as const };
    if (!res.ok) return { error: true as const };
    const data = await res.json();
    // GitHub reports repo size in KB.
    return { kb: data.size as number, missing: false as const };
  } catch {
    return { error: true as const };
  }
}

async function getDbUsage() {
  const supabase = createPublicClient();
  let sizeBytes: number | null = null;
  let rpcMissing = false;
  try {
    const { data, error } = await supabase.rpc("get_database_size");
    if (error) rpcMissing = true;
    else sizeBytes = data as number;
  } catch {
    rpcMissing = true;
  }

  const counts: Record<string, number | null> = {};
  for (const table of ["posts", "page_views", "quiz_attempts", "quizzes"]) {
    try {
      const { count } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      counts[table] = count;
    } catch {
      counts[table] = null;
    }
  }
  return { sizeBytes, rpcMissing, counts };
}

async function getTraffic() {
  const supabase = createPublicClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  try {
    const { count } = await supabase
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since.toISOString());
    return count ?? 0;
  } catch {
    return null;
  }
}

export default async function UsagePage() {
  const [images, db, visits30d] = await Promise.all([
    getImageRepoUsage(),
    getDbUsage(),
    getTraffic(),
  ]);

  const imageMb = "kb" in images && images.kb != null ? images.kb / 1024 : null;
  // GitHub soft-recommends keeping repos under ~1 GB; shard by year if close.
  const imagePct = imageMb != null ? (imageMb / 1024) * 100 : 0;
  const dbMb = db.sizeBytes != null ? db.sizeBytes / 1024 / 1024 : null;
  const dbPct = dbMb != null ? (dbMb / DB_FREE_MB) * 100 : 0;

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Usage</h1>
      <p className="mt-1 text-sm text-slate-500">
        Free-tier quotas at a glance — images, database and hosting.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Images */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-indigo-600" />
            <h2 className="font-bold">Images</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            GitHub repo <span className="font-mono">{IMAGE_REPO}</span> via
            jsDelivr CDN
          </p>
          {"missing" in images && images.missing ? (
            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              <p className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle size={15} /> Repo not created yet
              </p>
              <p className="mt-1">
                Create a public repo named{" "}
                <span className="font-mono">images</span> on
                GitHub — new uploads will go there automatically.
              </p>
            </div>
          ) : "error" in images ? (
            <p className="mt-4 text-sm text-slate-500">
              Couldn&apos;t reach the GitHub API right now.
            </p>
          ) : (
            <>
              <p className="mt-4 text-3xl font-extrabold">
                {imageMb != null ? `${imageMb.toFixed(1)} MB` : "—"}
              </p>
              <Bar pct={imagePct} tone="bg-indigo-500" />
              <p className="mt-1.5 text-xs text-slate-500">
                of ~1 GB soft limit per repo
                {imagePct > 80 && " — consider sharding into a second repo"}
              </p>
            </>
          )}
          <p className="mt-3 text-xs text-slate-400">
            Uploads are compressed to WebP (max 1600px) before storing.
          </p>
        </div>

        {/* Database */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-emerald-600" />
            <h2 className="font-bold">Database</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Supabase Postgres — {DB_FREE_MB} MB free
          </p>
          {db.rpcMissing ? (
            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              <p className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle size={15} /> Migration pending
              </p>
              <p className="mt-1">
                Run the latest <span className="font-mono">supabase/schema.sql</span>{" "}
                in the Supabase SQL Editor to enable size reporting.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-4 text-3xl font-extrabold">
                {dbMb != null ? `${dbMb.toFixed(1)} MB` : "—"}
              </p>
              <Bar
                pct={dbPct}
                tone={dbPct > 80 ? "bg-red-500" : "bg-emerald-500"}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                of {DB_FREE_MB} MB free tier
              </p>
            </>
          )}
          <dl className="mt-4 space-y-1.5 text-sm">
            {[
              ["Posts", db.counts.posts],
              ["Quizzes & mocks", db.counts.quizzes],
              ["Quiz attempts", db.counts.quiz_attempts],
              ["Page views (90-day window)", db.counts.page_views],
            ].map(([label, n]) => (
              <div key={label as string} className="flex justify-between">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-semibold tabular-nums">
                  {n == null ? "—" : n.toLocaleString("en-IN")}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-slate-400">
            Page views older than 90 days are pruned daily by the cron job.
          </p>
        </div>

        {/* Hosting */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-sky-600" />
            <h2 className="font-bold">Hosting</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Vercel Hobby — 100 GB bandwidth / month
          </p>
          <p className="mt-4 text-3xl font-extrabold">
            {visits30d == null ? "—" : visits30d.toLocaleString("en-IN")}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">visits in the last 30 days</p>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Vercel doesn&apos;t expose bandwidth usage on the free tier, so
            this page tracks visits instead. Check exact bandwidth in the{" "}
            <Link
              href="https://vercel.com/dashboard/usage"
              target="_blank"
              className="font-medium text-indigo-600 hover:underline"
            >
              Vercel dashboard
            </Link>
            . The homepage is ISR-cached (5 min), so most visits never hit a
            serverless function.
          </p>
        </div>
      </div>
    </div>
  );
}
