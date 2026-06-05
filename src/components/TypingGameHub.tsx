"use client";

import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import { BibleTypingMode } from "@/components/BibleTypingMode";
import { WordFallTypingGame } from "@/components/WordFallTypingGame";
import { useState } from "react";

type Mode = "words" | "bible";

const modeBtnClass = (active: boolean) =>
  `px-4 py-2 text-sm font-bold transition ${
    active
      ? "bg-white text-[var(--color-ink)] ring-1 ring-[var(--color-accent)]"
      : "text-[var(--color-muted)] hover:bg-white/60"
  }`;

export function TypingGameHub() {
  const copy = useSiteCopy();
  const t = (key: string, fallback = "") => textFromCopy(copy, key, fallback);
  const [mode, setMode] = useState<Mode>("words");

  const modes: { id: Mode; labelKey: string; fallback: string }[] = [
    { id: "words", labelKey: "play.typing.mode.words", fallback: "Word mode" },
    { id: "bible", labelKey: "play.typing.mode.bible", fallback: "Today's Bible" },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2 border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={modeBtnClass(mode === m.id)}
          >
            {t(m.labelKey, m.fallback)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {mode === "words" ? <WordFallTypingGame /> : <BibleTypingMode />}
      </div>
    </div>
  );
}
