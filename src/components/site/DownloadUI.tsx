"use client";

import { useState } from "react";

interface ExtractResult {
  platform: "youtube" | "instagram";
  title: string;
  thumbnail: string | null;
  downloadUrl: string;
  qualityLabel: string;
  filename: string;
}

export default function DownloadUI() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || loading) return;
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/dl/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data as ExtractResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Video Downloader</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Paste a YouTube or Instagram link, get the video file.
      </p>

      <form onSubmit={handleSubmit} className="mt-6">
        <label htmlFor="dl-url" className="sr-only">
          Video link
        </label>
        <input
          id="dl-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://www.youtube.com/watch?v=… or https://www.instagram.com/reel/…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base outline-none placeholder:text-neutral-400 focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="mt-3 w-full rounded-xl bg-neutral-900 px-4 py-3 text-base font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {loading ? "Fetching video…" : "Get download link"}
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
          {result.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.thumbnail}
              alt=""
              className="aspect-video w-full object-cover"
            />
          )}
          <div className="p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium capitalize text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {result.platform}
              </span>
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {result.qualityLabel}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-medium">{result.title}</p>
            <a
              href={result.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block w-full rounded-xl bg-green-600 px-4 py-3 text-center text-base font-semibold text-white"
            >
              Download video
            </a>
            <p className="mt-3 text-xs leading-relaxed text-neutral-500">
              On Android, if the video opens in the player instead of
              downloading, tap the <span className="font-semibold">⋮</span> menu
              in the player and choose <span className="font-semibold">Download</span>.
              Private posts and stories are not supported.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
