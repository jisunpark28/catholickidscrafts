"use client";

import { useState } from "react";
import { BibleTypingMode } from "@/components/BibleTypingMode";
import { WordFallTypingGame } from "@/components/WordFallTypingGame";

type Mode = "words" | "bible";

const MODES: { id: Mode; label: string }[] = [
  { id: "words", label: "Word mode" },
  { id: "bible", label: "Today's Bible" },
];

const modeBtnClass = (active: boolean) =>
  `px-4 py-2 text-sm font-bold transition ${
    active
      ? "bg-white text-[var(--color-ink)] ring-1 ring-[var(--color-accent)]"
      : "text-[var(--color-muted)] hover:bg-white/60"
  }`;

export function TypingGameHub() {
  const [mode, setMode] = useState<Mode>("words");

  return (
    <div>
      <div className="flex flex-wrap gap-2 border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={modeBtnClass(mode === m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {mode === "words" ? <WordFallTypingGame /> : <BibleTypingMode />}
      </div>
    </div>
  );
}
