"use client";

import { useCallback, useState } from "react";
import { PassageTypingGame } from "@/components/PassageTypingGame";
import { livingWithChristHomeUrl } from "@/lib/scripture-links";

const MAX_CHARS = 8_000;

export function PasteTypingMode() {
  const [draft, setDraft] = useState("");
  const [activeText, setActiveText] = useState<string | null>(null);
  const [title, setTitle] = useState("Your passage");

  const start = useCallback(() => {
    const trimmed = draft.replace(/\s+/g, " ").trim();
    if (!trimmed) return;
    setActiveText(trimmed.slice(0, MAX_CHARS));
  }, [draft]);

  const reset = useCallback(() => {
    setActiveText(null);
  }, []);

  if (activeText) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={reset}
          className="text-sm font-semibold text-[var(--color-link)] hover:underline"
        >
          ← Paste different text
        </button>
        <PassageTypingGame key={activeText.slice(0, 80)} title={title} text={activeText} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-muted)]">
        Copy a reading from{" "}
        <a
          href={livingWithChristHomeUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--color-link)]"
        >
          Living with Christ
        </a>
        ,{" "}
        <a
          href="https://bible.usccb.org/bible/readings/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--color-link)]"
        >
          USCCB Daily Readings
        </a>
        , or your missal, then paste below. Use only text you are allowed to copy for personal
        practice.
      </p>

      <label className="block text-sm font-semibold">
        Title (optional)
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full max-w-md border border-[var(--color-border)] bg-white px-3 py-2"
          placeholder="e.g. Gospel — June 4"
        />
      </label>

      <label className="block text-sm font-semibold">
        Passage to type
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHARS))}
          rows={10}
          className="mt-1 block w-full border border-[var(--color-border)] bg-white px-3 py-2 font-mono text-sm leading-relaxed"
          placeholder="Paste reading text here…"
        />
      </label>

      <p className="text-xs text-[var(--color-muted)]">
        {draft.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
      </p>

      <button
        type="button"
        onClick={start}
        disabled={!draft.trim()}
        className="bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
      >
        Start typing
      </button>
    </div>
  );
}
