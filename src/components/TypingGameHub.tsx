"use client";

import { useState } from "react";
import { BibleTypingMode } from "@/components/BibleTypingMode";
import { WordFallTypingGame } from "@/components/WordFallTypingGame";

type Mode = "words" | "bible";

const MODES: { id: Mode; label: string; description: string }[] = [
  {
    id: "words",
    label: "Word mode",
    description: "Catholic words fall from the sky—type them before they land.",
  },
  {
    id: "bible",
    label: "Today’s Bible",
    description: "Pick a Mass date and practice First Reading, Second Reading, or Gospel.",
  },
];

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
            className={`flex-1 min-w-[140px] px-4 py-3 text-left transition sm:flex-none sm:min-w-[200px] ${
              mode === m.id
                ? "bg-white shadow-sm ring-1 ring-[var(--color-accent)]"
                : "hover:bg-white/60"
            }`}
          >
            <span className="block text-sm font-bold text-[var(--color-ink)]">{m.label}</span>
            <span className="mt-0.5 block text-xs text-[var(--color-muted)]">{m.description}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">{mode === "words" ? <WordFallTypingGame /> : <BibleTypingMode />}</div>
    </div>
  );
}
