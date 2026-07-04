"use client";

import {
  LESSON_BLOCK_DEFAULT_LABEL,
  LESSON_GAME_SLUGS,
  LESSON_RESOURCE_SLUGS,
  LESSON_WORD_PRESETS,
} from "@/lib/lesson-kit/constants";
import {
  defaultFamilyIncludedByType,
  familyIncludeHint,
} from "@/lib/lesson-kit/family-blocks";
import {
  lessonLinkButtonLabel,
  lessonLinkHref,
  validateLessonLinkUrl,
} from "@/lib/lesson-kit/link-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";
import type { FamilyPickMode } from "@/components/lesson/LessonFamilyModePanel";
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
  familyPickMode?: FamilyPickMode;
  onChange: (next: LessonBlockDto) => void;
  onClose: () => void;
};

function fieldLabel(type: LessonBlockType) {
  return LESSON_BLOCK_DEFAULT_LABEL[type];
}

function triStateFamilyInclude(block: LessonBlockDto): "on" | "off" | "default" {
  if (block.config.familyInclude === true) return "on";
  if (block.config.familyInclude === false) return "off";
  return "default";
}

function LessonLinkConfigFields({
  block,
  patch,
}: {
  block: LessonBlockDto;
  patch: (partial: Partial<LessonBlockDto["config"]>) => void;
}) {
  const urlInput = block.config.url ?? "";
  const validation = urlInput.trim() ? validateLessonLinkUrl(urlInput) : null;
  const previewHref = lessonLinkHref(block);

  return (
    <>
      <label className="lesson-block-config__field">
        <span>URL</span>
        <input
          type="url"
          value={urlInput}
          placeholder="https://..."
          onChange={(e) => patch({ url: e.target.value })}
        />
        {validation && !validation.valid ? (
          <p className="mt-1 text-xs font-semibold text-red-600">{validation.error}</p>
        ) : null}
      </label>

      <label className="lesson-block-config__field">
        <span>Button label</span>
        <input
          type="text"
          value={block.config.buttonLabel ?? ""}
          placeholder="e.g. Opening prayer"
          onChange={(e) => patch({ buttonLabel: e.target.value })}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
        <input
          type="checkbox"
          checked={block.config.openInNewTab !== false}
          onChange={(e) => patch({ openInNewTab: e.target.checked })}
        />
        Open in new tab
      </label>

      {previewHref ? (
        <div className="lesson-block-config__field mt-2 border-t border-[var(--color-border)] pt-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Preview
          </span>
          <div className="mt-2 flex justify-center rounded border border-dashed border-[var(--color-border)] bg-white p-4">
            <a
              href={previewHref}
              className="lesson-big-button inline-flex no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {lessonLinkButtonLabel(block)}
            </a>
          </div>
          <p className="mt-2 break-all text-xs text-[var(--color-muted)]">{previewHref}</p>
        </div>
      ) : null}
    </>
  );
}

export function LessonBlockConfigPanel({
  block,
  familyPickMode = "auto",
  onChange,
  onClose,
}: Props) {
  const patch = (partial: Partial<LessonBlockDto["config"]>, label?: string | null) => {
    onChange({
      ...block,
      label: label !== undefined ? label : block.label,
      config: { ...block.config, ...partial },
    });
  };

  const familyState = triStateFamilyInclude(block);
  const defaultOn = defaultFamilyIncludedByType(block.type);

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
          <span>Max characters (class)</span>
          <input
            type="number"
            min={80}
            max={1200}
            value={block.config.maxChars ?? 400}
            onChange={(e) => patch({ maxChars: Number(e.target.value) || 400, readingKind: "gospel" })}
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            At-home Gospel length is set in At-home link above.
          </p>
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

      {block.type === "LINK" && (
        <LessonLinkConfigFields block={block} patch={patch} />
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

      {familyPickMode === "auto" ? (
        <div className="lesson-block-config__field mt-2 border-t border-[var(--color-border)] pt-3">
          <span className="font-semibold text-[var(--color-ink)]">At-home link</span>
          <p className="mt-1 text-xs text-[var(--color-muted)]">{familyIncludeHint(block)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                { value: "default" as const, label: defaultOn ? "Default (on)" : "Default (off)" },
                { value: "on" as const, label: "Always on" },
                { value: "off" as const, label: "Class only" },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className={`cursor-pointer rounded border px-3 py-1.5 text-xs font-semibold ${
                  familyState === opt.value
                    ? "border-[var(--color-accent)] bg-white text-[var(--color-ink)]"
                    : "border-[var(--color-border)] text-[var(--color-muted)]"
                }`}
              >
                <input
                  type="radio"
                  name={`family-${block.id}`}
                  className="sr-only"
                  checked={familyState === opt.value}
                  onChange={() => {
                    if (opt.value === "default") {
                      const nextConfig = { ...block.config };
                      delete nextConfig.familyInclude;
                      onChange({ ...block, config: nextConfig });
                    } else {
                      patch({ familyInclude: opt.value === "on" });
                    }
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-2 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-muted)]">
          At-home steps are chosen in <strong>Pick exact steps</strong> above.
        </p>
      )}
    </div>
  );
}
