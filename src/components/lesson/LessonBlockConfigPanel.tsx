"use client";

import {
  LESSON_BLOCK_DEFAULT_LABEL,
  LESSON_GAME_SLUGS,
  LESSON_RESOURCE_SLUGS,
  LESSON_WORD_PRESETS,
} from "@/lib/lesson-kit/constants";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";
import type { LessonBlockType } from "@prisma/client";

const BIBLE_BOOK_OPTIONS = [
  { slug: "genesis", label: "Genesis" },
  { slug: "exodus", label: "Exodus" },
  { slug: "psalms", label: "Psalms" },
  { slug: "matthew", label: "Matthew" },
  { slug: "mark", label: "Mark" },
  { slug: "luke", label: "Luke" },
  { slug: "john", label: "John" },
  { slug: "acts", label: "Acts" },
] as const;

type Props = {
  block: LessonBlockDto;
  onChange: (next: LessonBlockDto) => void;
  onClose: () => void;
};

function fieldLabel(type: LessonBlockType) {
  return LESSON_BLOCK_DEFAULT_LABEL[type];
}

export function LessonBlockConfigPanel({ block, onChange, onClose }: Props) {
  const patch = (partial: Partial<LessonBlockDto["config"]>, label?: string | null) => {
    onChange({
      ...block,
      label: label !== undefined ? label : block.label,
      config: { ...block.config, ...partial },
    });
  };

  return (
    <div className="lesson-block-config border border-[var(--color-border)] bg-[#fffaf5] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-[var(--color-ink)]">
          Edit {fieldLabel(block.type)}
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        >
          Done
        </button>
      </div>

      <label className="lesson-block-config__field">
        <span>Step label (optional)</span>
        <input
          type="text"
          value={block.label ?? ""}
          placeholder={fieldLabel(block.type)}
          onChange={(e) => onChange({ ...block, label: e.target.value || null })}
        />
      </label>

      {block.type === "PLAY_GAME" && (
        <label className="lesson-block-config__field">
          <span>Game</span>
          <select
            value={block.config.gameSlug ?? LESSON_GAME_SLUGS[0]!.slug}
            onChange={(e) => patch({ gameSlug: e.target.value })}
          >
            {LESSON_GAME_SLUGS.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {block.type === "TYPING_WORDS" && (
        <label className="lesson-block-config__field">
          <span>Word list</span>
          <select
            value={block.config.wordPreset ?? "advent"}
            onChange={(e) => patch({ wordPreset: e.target.value, wordIds: undefined })}
          >
            {Object.entries(LESSON_WORD_PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {block.type === "GOSPEL_TYPING" && (
        <label className="lesson-block-config__field">
          <span>Max characters</span>
          <input
            type="number"
            min={80}
            max={1200}
            value={block.config.maxChars ?? 400}
            onChange={(e) => patch({ maxChars: Number(e.target.value) || 400, readingKind: "gospel" })}
          />
        </label>
      )}

      {block.type === "BIBLE_CHAPTER" && (
        <>
          <label className="lesson-block-config__field">
            <span>Book</span>
            <select
              value={block.config.bookSlug ?? "matthew"}
              onChange={(e) => patch({ bookSlug: e.target.value })}
            >
              {BIBLE_BOOK_OPTIONS.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          <label className="lesson-block-config__field">
            <span>Chapter</span>
            <input
              type="number"
              min={1}
              max={150}
              value={block.config.chapter ?? 1}
              onChange={(e) => patch({ chapter: Number(e.target.value) || 1 })}
            />
          </label>
          <label className="lesson-block-config__field">
            <span>Max characters (optional)</span>
            <input
              type="number"
              min={80}
              max={1200}
              value={block.config.maxChars ?? ""}
              placeholder="Default"
              onChange={(e) => {
                const n = e.target.value ? Number(e.target.value) : undefined;
                patch({ maxChars: n });
              }}
            />
          </label>
        </>
      )}

      {block.type === "RESOURCE" && (
        <label className="lesson-block-config__field">
          <span>Activity</span>
          <select
            value={block.config.resourceSlug ?? LESSON_RESOURCE_SLUGS[0]!.slug}
            onChange={(e) => patch({ resourceSlug: e.target.value })}
          >
            {LESSON_RESOURCE_SLUGS.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {block.type === "CUSTOM_NOTE" && (
        <label className="lesson-block-config__field">
          <span>Note HTML</span>
          <textarea
            rows={4}
            value={block.config.html ?? ""}
            onChange={(e) => patch({ html: e.target.value })}
          />
        </label>
      )}

      {block.type === "HANGMAN_WORDS" && (
        <p className="text-xs text-[var(--color-muted)]">
          Uses the site hangman word list. No extra settings needed.
        </p>
      )}

      {block.type === "MASS_TODAY" && (
        <p className="text-xs text-[var(--color-muted)]">
          Links to today&apos;s Mass calendar page.
        </p>
      )}

      {block.type !== "MASS_TODAY" && (
        <label className="lesson-block-config__field flex items-center gap-2">
          <input
            type="checkbox"
            checked={block.config.familyInclude !== false}
            onChange={(e) => patch({ familyInclude: e.target.checked })}
          />
          <span className="!mb-0">Include in at-home link</span>
        </label>
      )}
    </div>
  );
}
