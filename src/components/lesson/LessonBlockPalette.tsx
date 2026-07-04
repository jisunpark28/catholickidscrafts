"use client";

import { LessonBlockIcon } from "@/components/icons/lesson/LessonIcon";
import {
  DEFAULT_PALETTE_CATEGORY,
  LESSON_BLOCK_PALETTE,
  type LessonBlockPaletteCategory,
} from "@/lib/lesson-kit/block-palette";
import type { LessonBlockType } from "@prisma/client";
import { useState } from "react";

type Props = {
  onPick: (type: LessonBlockType) => void;
  onCancel: () => void;
};

export function LessonBlockPalette({ onPick, onCancel }: Props) {
  const [category, setCategory] = useState<LessonBlockPaletteCategory>(DEFAULT_PALETTE_CATEGORY);
  const group = LESSON_BLOCK_PALETTE.find((g) => g.id === category) ?? LESSON_BLOCK_PALETTE[0]!;

  return (
    <div className="lesson-block-palette border border-[var(--color-border)] bg-white p-4">
      <div className="lesson-block-palette__header">
        <h3 className="text-sm font-bold text-[var(--color-ink)]">Add a puzzle piece</h3>
        <p className="mt-0.5 text-xs text-[var(--color-muted)]">
          Build your lesson step by step. Image and slide blocks arrive in upcoming updates.
        </p>
      </div>

      <div
        className="lesson-block-palette__tabs mt-4"
        role="tablist"
        aria-label="Block categories"
      >
        {LESSON_BLOCK_PALETTE.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            id={`palette-tab-${g.id}`}
            aria-selected={category === g.id}
            aria-controls={`palette-panel-${g.id}`}
            onClick={() => setCategory(g.id)}
            className={`lesson-block-palette__tab ${category === g.id ? "lesson-block-palette__tab--active" : ""}`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <p className="mt-2 text-xs text-[var(--color-muted)]">{group.description}</p>

      <div
        id={`palette-panel-${group.id}`}
        role="tabpanel"
        aria-labelledby={`palette-tab-${group.id}`}
        className="lesson-add-grid mt-3"
      >
        {group.blocks.map((entry) => (
          <button
            key={entry.type}
            type="button"
            onClick={() => onPick(entry.type)}
            className="lesson-add-cell lesson-add-cell--described"
            title={entry.description}
          >
            <LessonBlockIcon type={entry.type} size="lg" />
            <span>{entry.paletteLabel}</span>
            <span className="lesson-add-cell__hint">{entry.description}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="mt-4 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
      >
        Cancel
      </button>
    </div>
  );
}
