"use client";

import { useState } from "react";
import { Send, Loader2, Check } from "lucide-react";
import { announcePostToTelegram } from "@/lib/actions/posts";

/**
 * Admin button: (re)send an already-published post to Telegram.
 * Used for old posts that went live before the announcement fired,
 * or were published with "Send to Telegram" unchecked.
 */
export default function SendToTelegramButton({ id }: { id: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function onClick() {
    if (state === "busy") return;
    if (
      !confirm("Send this post to the Telegram channel now?")
    )
      return;
    setState("busy");
    setMsg(null);
    try {
      const res = await announcePostToTelegram(id);
      if (res.ok) {
        setState("done");
      } else if (res.skipped) {
        setState("error");
        setMsg("Telegram is not configured on the server.");
      } else {
        setState("error");
        setMsg(res.error ?? "Send failed.");
      }
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Send failed.");
    }
  }

  return (
    <span className="inline-flex items-center" title={msg ?? "Send to Telegram"}>
      <button
        type="button"
        onClick={onClick}
        disabled={state === "busy"}
        className={`rounded-lg p-2 transition disabled:opacity-50 ${
          state === "done"
            ? "text-emerald-600"
            : "text-slate-400 hover:bg-sky-50 hover:text-sky-600"
        }`}
      >
        {state === "busy" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : state === "done" ? (
          <Check size={16} />
        ) : (
          <Send size={16} />
        )}
      </button>
      {state === "error" && msg && (
        <span className="max-w-[140px] text-[11px] font-medium text-red-600">
          {msg}
        </span>
      )}
    </span>
  );
}
