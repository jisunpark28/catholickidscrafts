"use client";

import { LessonIcon } from "@/components/icons/lesson/LessonIcon";
import { blockDisplayLabel, countFamilySteps } from "@/lib/lesson-kit/family-blocks";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";
import Link from "next/link";

export type FamilyPickMode = "auto" | "manual";

type Props = {
  shareSlug: string;
  blocks: LessonBlockDto[];
  gospelMaxChars: number;
  onGospelMaxCharsChange: (value: number) => void;
  pickMode: FamilyPickMode;
  onPickModeChange: (mode: FamilyPickMode) => void;
  includedStepIndexes: number[];
  onToggleManualStep: (index: number) => void;
};

export function LessonFamilyModePanel({
  shareSlug,
  blocks,
  gospelMaxChars,
  onGospelMaxCharsChange,
  pickMode,
  onPickModeChange,
  includedStepIndexes,
  onToggleManualStep,
}: Props) {
  const previewFamilyMode =
    pickMode === "manual" && includedStepIndexes.length > 0
      ? {
          gospelMaxChars,
          includedBlockIds: includedStepIndexes.map((i) => blocks[i]?.id).filter(Boolean) as string[],
        }
      : { gospelMaxChars };

  const atHomeCount = countFamilySteps(blocks, previewFamilyMode);
  const classCount = blocks.length;

  return (
    <section className="lesson-family-panel rounded border border-[var(--color-border)] bg-[#fffaf5] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">At-home link</h3>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Students open a shorter version (~10 min). Class steps stay on the classroom link.
          </p>
        </div>
        <Link
          href={`/lesson/${shareSlug}/family`}
          className="text-xs font-semibold text-[var(--color-link)]"
          target="_blank"
        >
          Preview at-home →
        </Link>
      </div>

      <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
        <LessonIcon name="home" size="sm" className="mr-1 inline-block align-text-bottom" />
        {atHomeCount} of {classCount} step{classCount === 1 ? "" : "s"} at home
      </p>

      <label className="mt-4 block text-sm">
        <span className="font-semibold text-[var(--color-ink)]">Gospel length at home</span>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <input
            type="range"
            min={80}
            max={400}
            step={10}
            value={gospelMaxChars}
            onChange={(e) => onGospelMaxCharsChange(Number(e.target.value))}
            className="min-w-[10rem] flex-1"
          />
          <span className="font-mono text-sm text-[var(--color-muted)]">{gospelMaxChars} chars</span>
        </div>
      </label>

      <fieldset className="mt-4 space-y-2 border-0 p-0">
        <legend className="text-sm font-semibold text-[var(--color-ink)]">Which steps go home?</legend>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-[var(--color-muted)]">
          <input
            type="radio"
            name="family-pick-mode"
            checked={pickMode === "auto"}
            onChange={() => onPickModeChange("auto")}
            className="mt-1"
          />
          <span>
            <strong className="text-[var(--color-ink)]">Smart defaults</strong> — toggle each step below or in
            step settings. Games & Gospel on; long crafts & notes off unless you enable them.
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-[var(--color-muted)]">
          <input
            type="radio"
            name="family-pick-mode"
            checked={pickMode === "manual"}
            onChange={() => onPickModeChange("manual")}
            className="mt-1"
          />
          <span>
            <strong className="text-[var(--color-ink)]">Pick exact steps</strong> — only checked steps appear
            at home (ignores per-step defaults).
          </span>
        </label>
      </fieldset>

      {pickMode === "manual" ? (
        <ul className="mt-3 space-y-1 border-t border-[var(--color-border)] pt-3">
          {blocks.length === 0 ? (
            <li className="text-xs text-[var(--color-muted)]">Add class steps first.</li>
          ) : (
            blocks.map((block, index) => (
              <li key={block.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-white">
                  <input
                    type="checkbox"
                    checked={includedStepIndexes.includes(index)}
                    onChange={() => onToggleManualStep(index)}
                  />
                  <span className="text-[var(--color-muted)]">{index + 1}.</span>
                  <span className="text-[var(--color-ink)]">{blockDisplayLabel(block)}</span>
                </label>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </section>
  );
}
