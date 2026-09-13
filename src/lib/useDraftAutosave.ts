"use client";

import { useEffect, useRef, useState } from "react";

interface DraftEnvelope<T> {
  data: T;
  savedAt: string;
}

/**
 * Debounced localStorage autosave for a form's data, with a restore prompt
 * for anything found on mount instead of silently overwriting it.
 *
 * Saving is paused until the caller has "decided" what to do with any
 * existing draft (via `restore()` or `discard()`) — otherwise the very
 * first autosave tick would immediately clobber an old draft with the
 * freshly-loaded (undecided) form state before the user ever saw it.
 */
export function useDraftAutosave<T>(key: string, data: T, enabled = true) {
  const [restorable, setRestorable] = useState<DraftEnvelope<T> | null>(null);
  const [decided, setDecided] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Look for an existing draft once, on mount (or when the key changes —
  // e.g. navigating from "new post" to editing a saved one). This is a
  // one-time sync from an external store (localStorage), which is exactly
  // what effects are for — the resulting setState calls are intentional.
  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDecided(true);
      return;
    }
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setRestorable(JSON.parse(raw));
      } else {
        setDecided(true);
      }
    } catch {
      setDecided(true);
    }
  }, [key, enabled]);

  useEffect(() => {
    if (!enabled || !decided) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ data, savedAt: new Date().toISOString() } satisfies DraftEnvelope<T>)
        );
      } catch {
        // Storage full or unavailable (private browsing, etc.) — autosave
        // just quietly stops working; manual save is unaffected.
      }
    }, 1500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, decided, enabled, JSON.stringify(data)]);

  function restore(): T | null {
    if (!restorable) return null;
    const restoredData = restorable.data;
    setRestorable(null);
    setDecided(true);
    return restoredData;
  }

  function discard() {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setRestorable(null);
    setDecided(true);
  }

  function clearDraft() {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }

  return {
    restorableDraft: restorable?.data ?? null,
    restorableSavedAt: restorable?.savedAt ?? null,
    restore,
    discard,
    clearDraft,
  };
}
