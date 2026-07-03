"use client";

import { LessonBlockConfigPanel } from "@/components/lesson/LessonBlockConfigPanel";
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
import { useCallback, useEffect, useRef, useState } from "react";

const ADD_TYPES: LessonBlockType[] = [
  "PLAY_GAME",
  "TYPING_WORDS",
  "GOSPEL_TYPING",
  "BIBLE_CHAPTER",
  "HANGMAN_WORDS",
  "MASS_TODAY",
  "CUSTOM_NOTE",
  "RESOURCE",
];

const AUTOSAVE_MS = 1200;

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
    case "BIBLE_CHAPTER":
      return { bookSlug: "matthew", chapter: 1, maxChars: 400 };
    case "HANGMAN_WORDS":
      return { gameSlug: "hangman" };
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
  const [saveState, setSaveState] = useState<"idle" | "dirty" | "saved" | "error">("idle");
  const [showAdd, setShowAdd] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(
    JSON.stringify({ title: initialKit.title, blocks: initialKit.blocks }),
  );

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
      lastSavedRef.current = JSON.stringify({ title, blocks: data.kit.blocks });
      setSaveState("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setSaveState("error");
    } finally {
      setSaving(false);
    }
  }, [kit.id, title, blocks]);

  useEffect(() => {
    const snapshot = JSON.stringify({ title, blocks });
    if (snapshot === lastSavedRef.current) return;

    setSaveState("dirty");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void save();
    }, AUTOSAVE_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, blocks, save]);

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
    setEditingIndex(blocks.length);
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
    setEditingIndex((current) => {
      if (current === index) return null;
      if (current !== null && current > index) return current - 1;
      return current;
    });
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
    setEditingIndex((current) => {
      if (current === null) return null;
      const j = current + dir;
      if (current === index) return j;
      if (current === index + dir) return index;
      return current;
    });
  };

  const updateBlock = (index: number, next: LessonBlockDto) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? next : b)));
  };

  const saveHint =
    saveState === "dirty" || saving
      ? "Saving…"
      : saveState === "saved"
        ? "All changes saved"
        : saveState === "error"
          ? "Save failed — tap Save"
          : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/program" className="text-sm font-semibold text-[var(--color-link)]">
          ← My lessons
        </Link>
        <div className="flex items-center gap-3">
          {saveHint ? (
            <span className="text-xs font-semibold text-[var(--color-muted)]">{saveHint}</span>
          ) : null}
          <Link
            href={`/lesson/${kit.shareSlug}`}
            className="lesson-big-button !min-h-0 !w-auto !px-5 !py-2 !text-sm no-underline"
          >
            Run
          </Link>
        </div>
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
          <li key={block.id} className="space-y-2">
            <div
              className={`lesson-block-row ${editingIndex === index ? "lesson-block-row--active" : ""}`}
            >
              <span className="text-sm font-bold text-[var(--color-muted)]">{index + 1}</span>
              <LessonBlockIcon type={block.type} active size="sm" />
              <button
                type="button"
                onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                className="lesson-block-row__label text-left hover:text-[var(--color-accent)]"
              >
                {blockDisplayLabel(block)}
              </button>
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
            </div>
            {editingIndex === index ? (
              <LessonBlockConfigPanel
                block={block}
                onChange={(next) => updateBlock(index, next)}
                onClose={() => setEditingIndex(null)}
              />
            ) : null}
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
        {saving ? "Saving…" : "Save now"}
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
