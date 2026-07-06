"use client";

import {
  kitWordsToText,
  lessonKitWords,
  parseKitWordsText,
  type LessonKitWordEntry,
} from "@/lib/lesson-kit/kit-words";
import { LESSON_WORD_PRESETS } from "@/lib/lesson-kit/constants";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";
import { useEffect, useId, useState } from "react";

type Props = {
  block: LessonBlockDto;
  onChange: (entries: LessonKitWordEntry[]) => void;
  showPresets?: boolean;
};

function commitEntries(rows: LessonKitWordEntry[]): LessonKitWordEntry[] {
  const seen = new Set<string>();
  const out: LessonKitWordEntry[] = [];
  for (const row of rows) {
    const word = row.word.trim();
    if (!word) continue;
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const hint = row.hint?.trim();
    out.push(hint ? { word, hint } : { word });
  }
  return out;
}

export function LessonKitWordsEditor({ block, onChange, showPresets = true }: Props) {
  const saved = lessonKitWords(block);
  const [rows, setRows] = useState<LessonKitWordEntry[]>(() =>
    saved.length > 0 ? saved : [{ word: "", hint: "" }],
  );
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const listId = useId();

  useEffect(() => {
    const next = lessonKitWords(block);
    setRows(next.length > 0 ? next : [{ word: "", hint: "" }]);
    // Reset word rows only when switching to a different block step.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- block.id is intentional
  }, [block.id]);

  const pushToParent = (nextRows: LessonKitWordEntry[]) => {
    setRows(nextRows);
    onChange(commitEntries(nextRows));
  };

  const updateRow = (index: number, patch: Partial<LessonKitWordEntry>) => {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    pushToParent(next);
  };

  const addRow = () => {
    pushToParent([...rows, { word: "", hint: "" }]);
  };

  const removeRow = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    pushToParent(next.length > 0 ? next : [{ word: "", hint: "" }]);
  };

  const importPreset = (key: string) => {
    const preset = LESSON_WORD_PRESETS[key];
    if (!preset) return;
    const merged = commitEntries(rows);
    const seen = new Set(merged.map((e) => e.word.toLowerCase()));
    for (const word of preset.words) {
      const w = word.trim();
      if (!w || seen.has(w.toLowerCase())) continue;
      seen.add(w.toLowerCase());
      merged.push({ word: w });
    }
    pushToParent(merged);
  };

  const applyBulkPaste = () => {
    const pasted = parseKitWordsText(bulkText);
    if (pasted.length === 0) return;
    const merged = commitEntries([...commitEntries(rows), ...pasted]);
    pushToParent(merged);
    setBulkText("");
    setBulkOpen(false);
  };

  const readyCount = commitEntries(rows).length;

  return (
    <div className="lesson-kit-words-editor">
      <div className="lesson-block-config__field">
        <span>Words for this lesson</span>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Add one row per word. Use <strong>Add word</strong> for each new word. Optional hint helps
          students during the game.
        </p>
      </div>

      <ul className="lesson-kit-words-editor__list" id={listId}>
        {rows.map((row, index) => (
          <li key={`${block.id}-word-${index}`} className="lesson-kit-words-editor__row">
            <label className="lesson-kit-words-editor__cell">
              <span className="sr-only">Word {index + 1}</span>
              <input
                type="text"
                value={row.word}
                placeholder="e.g. grace"
                onChange={(e) => updateRow(index, { word: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (index === rows.length - 1) addRow();
                  }
                }}
                aria-label={`Word ${index + 1}`}
              />
            </label>
            <label className="lesson-kit-words-editor__cell lesson-kit-words-editor__cell--hint">
              <span className="sr-only">Hint {index + 1}</span>
              <input
                type="text"
                value={row.hint ?? ""}
                placeholder="Hint (optional)"
                onChange={(e) => updateRow(index, { hint: e.target.value })}
                aria-label={`Hint for word ${index + 1}`}
              />
            </label>
            <button
              type="button"
              className="lesson-kit-words-editor__remove"
              onClick={() => removeRow(index)}
              disabled={rows.length === 1 && !row.word.trim() && !row.hint?.trim()}
              aria-label={`Remove word ${index + 1}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="lesson-kit-words-editor__add" onClick={addRow}>
        + Add word
      </button>

      {readyCount > 0 ? (
        <p className="mt-2 text-xs font-semibold text-[var(--color-ink)]">
          {readyCount} word{readyCount === 1 ? "" : "s"} ready for class
        </p>
      ) : (
        <p className="mt-2 text-xs font-semibold text-amber-800">
          Add at least one word before running in class.
        </p>
      )}

      <div className="mt-3 border-t border-[var(--color-border)] pt-3">
        <button
          type="button"
          className="text-xs font-semibold text-[var(--color-link)]"
          onClick={() => {
            setBulkOpen((o) => !o);
            if (!bulkOpen) setBulkText(kitWordsToText(commitEntries(rows)));
          }}
        >
          {bulkOpen ? "Hide bulk paste" : "Paste many words at once"}
        </button>
        {bulkOpen ? (
          <div className="mt-2">
            <textarea
              rows={5}
              className="w-full border border-[var(--color-border)] p-2 text-sm"
              value={bulkText}
              placeholder={"grace | God's help\nfaith\namen"}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--color-muted)]">One word per line. Hint after |</p>
            <button
              type="button"
              className="mt-2 rounded border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold"
              onClick={applyBulkPaste}
            >
              Apply pasted words
            </button>
          </div>
        ) : null}
      </div>

      {showPresets ? (
        <div className="mt-3 flex flex-wrap gap-2">
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
