"use client";

import {
  kitWordsToText,
  lessonKitWords,
  parseKitWordsText,
  type LessonKitWordEntry,
} from "@/lib/lesson-kit/kit-words";
import { LESSON_WORD_PRESETS } from "@/lib/lesson-kit/constants";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";

type Props = {
  block: LessonBlockDto;
  onChange: (entries: LessonKitWordEntry[]) => void;
  /** Show preset import buttons (editor only). */
  showPresets?: boolean;
};

export function LessonKitWordsEditor({ block, onChange, showPresets = true }: Props) {
  const entries = lessonKitWords(block);
  const text = kitWordsToText(entries);

  const applyText = (raw: string) => {
    onChange(parseKitWordsText(raw));
  };

  const importPreset = (key: string) => {
    const preset = LESSON_WORD_PRESETS[key];
    if (!preset) return;
    const merged = [...entries];
    const seen = new Set(merged.map((e) => e.word.toLowerCase()));
    for (const word of preset.words) {
      const w = word.trim();
      if (!w || seen.has(w.toLowerCase())) continue;
      seen.add(w.toLowerCase());
      merged.push({ word: w });
    }
    onChange(merged);
  };

  return (
    <div className="lesson-block-config__field">
      <span>Words for this lesson</span>
      <textarea
        rows={8}
        value={text}
        placeholder={"grace | God's help\nfaith\namen"}
        onChange={(e) => applyText(e.target.value)}
      />
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        One word per line. Add an optional hint after <code>|</code> (e.g.{" "}
        <code>alleluia | Praise God</code>). These words are used only in this lesson — not the
        site-wide game lists.
      </p>
      {entries.length > 0 ? (
        <p className="mt-1 text-xs font-semibold text-[var(--color-ink)]">
          {entries.length} word{entries.length === 1 ? "" : "s"} ready
        </p>
      ) : (
        <p className="mt-1 text-xs font-semibold text-amber-800">
          Add at least one word before running in class.
        </p>
      )}
      {showPresets ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="w-full text-xs text-[var(--color-muted)]">Import starter words:</span>
          {Object.entries(LESSON_WORD_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              className="rounded border border-[var(--color-border)] bg-white px-2 py-1 text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
              onClick={() => importPreset(key)}
            >
              + {preset.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
