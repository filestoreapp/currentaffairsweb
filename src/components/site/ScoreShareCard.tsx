"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Link2, Share2 } from "lucide-react";
import { siteUrl } from "@/lib/seo";

/**
 * Shareable mock-test score card — a 1080x1080 PNG drawn on a client-side
 * canvas (no new deps, no server cost). The image shows ONLY the real
 * result of this attempt: score, accuracy and (when other attempts exist)
 * the rank computed from the real stored leaderboard. The card always
 * carries the site name + URL printed on it, since an image can't link
 * by itself.
 */

const W = 1080;
const H = 1080;

function fmtScore(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  // If the title was cut short, mark it so the card never lies by omission.
  if (lines.length === maxLines && words.join(" ") !== lines.join(" ")) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.replace(/\s+\S*$/, "") + "…";
  }
  return lines;
}

export default function ScoreShareCard({
  testTitle,
  score,
  total,
  correct,
  accuracyPct,
  rank,
  totalAttempts,
  userName,
}: {
  testTitle: string;
  score: number;
  total: number;
  correct: number;
  accuracyPct: number;
  rank: number | null;
  totalAttempts: number;
  userName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shareState, setShareState] = useState<string | null>(null);
  const testUrl =
    typeof window !== "undefined" ? window.location.href : siteUrl();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background: deep slate -> indigo gradient + soft colour blobs.
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0f172a");
    bg.addColorStop(0.55, "#1e1b4b");
    bg.addColorStop(1, "#312e81");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const blob = (x: number, y: number, r: number, color: string) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };
    blob(120, 90, 340, "rgba(99,102,241,0.45)");
    blob(980, 180, 300, "rgba(245,158,11,0.28)");
    blob(940, 990, 360, "rgba(139,92,246,0.35)");

    // Amber rule + brand.
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(80, 76, 72, 10);
    ctx.fillStyle = "#ffffff";
    ctx.font = '700 34px "Plus Jakarta Sans", "Noto Sans Malayalam", sans-serif';
    ctx.textAlign = "left";
    ctx.fillText("KERALA PSC CURRENT AFFAIRS", 80, 140);
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("psccurrentaffairs.online", 80, 182);

    // Label.
    ctx.fillStyle = "#fbbf24";
    ctx.font = '800 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("M O C K   T E S T   S C O R E", 80, 300);

    // Test title, wrapped to at most 3 lines.
    ctx.fillStyle = "#ffffff";
    ctx.font = '800 62px "Plus Jakarta Sans", "Noto Sans Malayalam", sans-serif';
    const titleLines = wrapText(ctx, testTitle, W - 160, 3);
    titleLines.forEach((line, i) => ctx.fillText(line, 80, 392 + i * 78));

    // Big score.
    const scoreY = 392 + titleLines.length * 78 + 96;
    ctx.font = '800 170px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = "#ffffff";
    ctx.fillText(fmtScore(score), 80, scoreY);
    const scoreW = ctx.measureText(fmtScore(score)).width;
    ctx.font = '700 64px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText(` / ${total}`, 80 + scoreW + 16, scoreY);

    // Stat chips.
    const chipY = scoreY + 72;
    const chips: string[] = [`Accuracy ${accuracyPct}%`, `${correct} correct`];
    if (rank != null && totalAttempts >= 2) {
      chips.push(`Rank #${rank} of ${totalAttempts}`);
    } else if (totalAttempts <= 1) {
      chips.push("First attempt on this test");
    }
    ctx.font = '700 30px "Plus Jakarta Sans", sans-serif';
    let chipX = 80;
    for (const chip of chips) {
      const pad = 28;
      const w = ctx.measureText(chip).width + pad * 2;
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(chipX, chipY, w, 62, 31);
      } else {
        ctx.rect(chipX, chipY, w, 62);
      }
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(chip, chipX + pad, chipY + 41);
      chipX += w + 18;
      if (chipX > W - 80) break;
    }

    // Name, when given.
    let footerY = chipY + 150;
    if (userName.trim()) {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = '600 34px "Plus Jakarta Sans", "Noto Sans Malayalam", sans-serif';
      ctx.fillText(`— ${userName.trim()}`, 80, footerY);
      footerY += 64;
    }

    // Footer: Malayalam tagline + URLs (the card can't link by itself).
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = '600 30px "Noto Sans Malayalam", "Plus Jakarta Sans", sans-serif';
    ctx.fillText("സൗജന്യ മോക്ക് ടെസ്റ്റുകൾ, ക്വിസുകൾ, സിലബസ്", 80, H - 150);
    ctx.fillStyle = "#fbbf24";
    ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("psccurrentaffairs.online", 80, H - 100);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    const url = testUrl.replace(/^https?:\/\//, "");
    ctx.fillText(`Take this test: ${url}`, 80, H - 58);
  }, [testTitle, score, total, correct, accuracyPct, rank, totalAttempts, userName, testUrl]);

  useEffect(() => {
    draw();
    // Re-draw once webfonts arrive so Malayalam + display type render true.
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(draw).catch(() => undefined);
    }
  }, [draw]);

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "psc-mock-test-score.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      setShareState("Image downloaded — share it anywhere.");
    }, "image/png");
  }

  async function shareCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const text = `I scored ${fmtScore(score)} / ${total} (${accuracyPct}% accuracy) on "${testTitle}" — Kerala PSC Current Affairs mock test. Take it here: ${testUrl}`;
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    try {
      if (blob && navigator.share) {
        const file = new File([blob], "psc-mock-test-score.png", {
          type: "image/png",
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text, url: testUrl });
          setShareState("Shared — thanks for spreading the word!");
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({ title: testTitle, text, url: testUrl });
        setShareState("Shared — thanks for spreading the word!");
        return;
      }
      await navigator.clipboard.writeText(`${text}`);
      setShareState("Link copied — paste it into WhatsApp or Instagram.");
    } catch {
      // User cancelled the share sheet, or the browser refused it.
      setShareState(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <Share2 size={16} className="text-indigo-600" /> Share your score
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Your real score from this attempt — download the card or share it on
        WhatsApp / Instagram. The card carries the site link, so anyone who
        sees it can find the test.
      </p>
      <div className="mx-auto mt-4 max-w-sm overflow-hidden rounded-xl ring-1 ring-slate-200">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="h-auto w-full"
          role="img"
          aria-label={`Score card: ${fmtScore(score)} out of ${total} on ${testTitle}`}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={downloadPng}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
        >
          <Download size={16} /> Download image (PNG)
        </button>
        <button
          type="button"
          onClick={shareCard}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <Share2 size={16} /> Share score
        </button>
      </div>
      {shareState ? (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-green-700">
          <Link2 size={14} /> {shareState}
        </p>
      ) : null}
    </div>
  );
}
