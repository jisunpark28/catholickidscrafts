"use client";

import { LessonBlockIcon, LessonIcon } from "@/components/icons/lesson/LessonIcon";
import { LessonShareSheet } from "@/components/lesson/LessonShareSheet";
import { LessonBigButton } from "@/components/lesson/LessonUi";
import {
  LESSON_BLOCK_DEFAULT_LABEL,
  LESSON_GAME_SLUGS,
  LESSON_WORD_PRESETS,
} from "@/lib/lesson-kit/constants";
import { blockDisplayLabel } from "@/lib/lesson-kit/family-blocks";
import type { LessonBlockDto, LessonKitDto } from "@/lib/lesson-kit/types";
import type { LessonBlockType } from "@prisma/client";
import Link from "next/link";
import { useCallback, useState } from "react";

const ADD_TYPES: LessonBlockType[] = [
  "PLAY_GAME",
  "TYPING_WORDS",
  "GOSPEL_TYPING",
  "MASS_TODAY",
  "CUSTOM_NOTE",
  "RESOURCE",
];

type Props = {
  initialKit: LessonKitDto;
};

function defaultConfig(type: LessonBlockType): LessonBlockDto["config"] {
  switch (type) {
    case "PLAY_GAME":
      return { gameSlug: "liturgical-vestments" };
    case "TYPING_WORDS":
      return { wordPreset: "advent" };
    case "GOSPEL_TYPING":
      return { readingKind: "gospel", maxChars: 400 };
    case "CUSTOM_NOTE":
      return { html: "<p>Ask the children a question about today's Mass.</p>" };
    case "RESOURCE":
      return { resourceSlug: "advent-wreath-craft" };
    case "MASS_TODAY":
      return {};
    default:
      return {};
  }
}

export function LessonKitEditor({ initialKit }: Props) {
  const [kit, setKit] = useState(initialKit);
  const [title, setTitle] = useState(kit.title);
  const [blocks, setBlocks] = useState<LessonBlockDto[]>(kit.blocks);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");

  const save = useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/program/kits/${kit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Could not save title");
      const blockRes = await fetch(`/api/program/kits/${kit.id}/blocks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocks: blocks.map((b, i) => ({
            sortOrder: i,
            type: b.type,
            label: b.label,
            config: b.config,
          })),
        }),
      });
      if (!blockRes.ok) throw new Error("Could not save steps");
      const data = (await blockRes.json()) as { kit: LessonKitDto };
      setKit(data.kit);
      setBlocks(data.kit.blocks);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [kit.id, title, blocks]);

  const addBlock = (type: LessonBlockType) => {
    setBlocks((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        sortOrder: prev.length,
        type,
        label: null,
        config: defaultConfig(type),
      },
    ]);
    setShowAdd(false);
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    setBlocks((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      const tmp = next[index]!;
      next[index] = next[j]!;
      next[j] = tmp;
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/program" className="text-sm font-semibold text-[var(--color-link)]">
          ← My lessons
        </Link>
        <Link
          href={`/lesson/${kit.shareSlug}`}
          className="lesson-big-button !min-h-0 !w-auto !px-5 !py-2 !text-sm no-underline"
        >
          Run
        </Link>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-[var(--color-ink)]">Title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-lg font-bold"
        />
      </label>

      <ul className="space-y-2">
        {blocks.map((block, index) => (
          <li key={block.id} className="lesson-block-row">
            <span className="text-sm font-bold text-[var(--color-muted)]">{index + 1}</span>
            <LessonBlockIcon type={block.type} active size="sm" />
            <span className="lesson-block-row__label">{blockDisplayLabel(block)}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Move up"
                onClick={() => moveBlock(index, -1)}
                className="p-2 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="Move down"
                onClick={() => moveBlock(index, 1)}
                className="p-2 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                ↓
              </button>
              <LessonIcon name="grip" size="sm" />
              <button
                type="button"
                aria-label="Remove step"
                onClick={() => removeBlock(index)}
                className="p-2 text-[var(--color-muted)] hover:text-red-600"
              >
                <LessonIcon name="trash" size="sm" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setShowAdd(true)}
        className="w-full border border-dashed border-[var(--color-border)] py-3 text-sm font-bold text-[var(--color-muted)] hover:border-[var(--color-accent)]"
      >
        + Add step
      </button>

      {showAdd && (
        <div className="border border-[var(--color-border)] bg-white p-4">
          <div className="lesson-add-grid">
            {ADD_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addBlock(type)}
                className="lesson-add-cell"
              >
                <LessonBlockIcon type={type} size="lg" />
                {LESSON_BLOCK_DEFAULT_LABEL[type]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAdd(false)}
            className="mt-3 text-sm font-semibold text-[var(--color-muted)]"
          >
            Cancel
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <LessonBigButton onClick={() => void save()} disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </LessonBigButton>

      <LessonShareSheet shareSlug={kit.shareSlug} title={kit.title} />

      <details className="text-xs text-[var(--color-muted)]">
        <summary className="cursor-pointer font-semibold">Presets reference</summary>
        <p className="mt-2">Word presets: {Object.keys(LESSON_WORD_PRESETS).join(", ")}</p>
        <p className="mt-1">Games: {LESSON_GAME_SLUGS.map((g) => g.slug).join(", ")}</p>
      </details>
    </div>
  );
}
