"use client";

import { LessonBlockConfigPanel } from "@/components/lesson/LessonBlockConfigPanel";
import { LessonBlockPalette } from "@/components/lesson/LessonBlockPalette";
import {
  LessonFamilyModePanel,
  type FamilyPickMode,
} from "@/components/lesson/LessonFamilyModePanel";
import { LessonBlockIcon, LessonIcon } from "@/components/icons/lesson/LessonIcon";
import { LessonShareSheet } from "@/components/lesson/LessonShareSheet";
import { TptPartnerNote } from "@/components/lesson/TptPartnerNote";
import { LessonBigButton } from "@/components/lesson/LessonUi";
import {
  adminTemplateEditNavItems,
  LessonKitNav,
  type LessonKitNavItem,
  teacherEditNavItems,
} from "@/components/lesson/LessonKitNav";
import {
  LESSON_GAME_SLUGS,
  LESSON_WORD_PRESETS,
} from "@/lib/lesson-kit/constants";
import { defaultBlockConfig } from "@/lib/lesson-kit/block-palette";
import {
  blockDisplayLabel,
  buildFamilyModeConfig,
  isBlockIncludedInFamily,
  stepIndexesFromIncludedIds,
} from "@/lib/lesson-kit/family-blocks";
import type { LessonBlockDto, LessonKitDto } from "@/lib/lesson-kit/types";
import type { LessonBlockType } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const AUTOSAVE_MS = 1200;

type Props = {
  initialKit: LessonKitDto;
  apiBase?: string;
  printHref?: string | null;
  adminMeta?: boolean;
  /** Override default breadcrumb trail. */
  navItems?: LessonKitNavItem[];
};

function remapIndexesOnRemove(indexes: number[], removed: number): number[] {
  return indexes.filter((i) => i !== removed).map((i) => (i > removed ? i - 1 : i));
}

function remapIndexesOnMove(indexes: number[], from: number, to: number): number[] {
  return indexes.map((i) => {
    if (i === from) return to;
    if (from < to && i > from && i <= to) return i - 1;
    if (from > to && i >= to && i < from) return i + 1;
    return i;
  });
}

function snapshotKey(input: {
  title: string;
  description: string;
  gradeBand: string;
  tptUrl: string;
  isFreeSample: boolean;
  published: boolean;
  communityVisible: boolean;
  authorDisplayName: string;
  sortOrder: number;
  liturgicalPeriod: string;
  gospelMaxChars: number;
  familyPickMode: FamilyPickMode;
  includedStepIndexes: number[];
  blocks: LessonBlockDto[];
}) {
  return JSON.stringify(input);
}

export function LessonKitEditor({
  initialKit,
  apiBase = "/api/program/kits",
  printHref,
  adminMeta = false,
  navItems,
}: Props) {
  const router = useRouter();
  const [kit, setKit] = useState(initialKit);
  const [title, setTitle] = useState(kit.title);
  const [description, setDescription] = useState(kit.description);
  const [gradeBand, setGradeBand] = useState(kit.gradeBand ?? "");
  const [tptUrl, setTptUrl] = useState(kit.tptUrl ?? "");
  const [isFreeSample, setIsFreeSample] = useState(kit.isFreeSample);
  const [published, setPublished] = useState(kit.published);
  const [communityVisible, setCommunityVisible] = useState(kit.communityVisible);
  const [authorDisplayName, setAuthorDisplayName] = useState(kit.authorDisplayName ?? "");
  const [sortOrder, setSortOrder] = useState(kit.sortOrder);
  const [liturgicalPeriod, setLiturgicalPeriod] = useState(kit.liturgicalPeriod ?? "");
  const [gospelMaxChars, setGospelMaxChars] = useState(kit.familyMode?.gospelMaxChars ?? 150);
  const [familyPickMode, setFamilyPickMode] = useState<FamilyPickMode>(
    (kit.familyMode?.includedBlockIds?.length ?? 0) > 0 ? "manual" : "auto",
  );
  const [includedStepIndexes, setIncludedStepIndexes] = useState<number[]>(() =>
    stepIndexesFromIncludedIds(kit.blocks, kit.familyMode?.includedBlockIds),
  );
  const [blocks, setBlocks] = useState<LessonBlockDto[]>(kit.blocks);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "dirty" | "saved" | "error">("idle");
  const [showAdd, setShowAdd] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(
    snapshotKey({
      title: initialKit.title,
      description: initialKit.description,
      gradeBand: initialKit.gradeBand ?? "",
      tptUrl: initialKit.tptUrl ?? "",
      isFreeSample: initialKit.isFreeSample,
      published: initialKit.published,
      communityVisible: initialKit.communityVisible,
      authorDisplayName: initialKit.authorDisplayName ?? "",
      sortOrder: initialKit.sortOrder,
      liturgicalPeriod: initialKit.liturgicalPeriod ?? "",
      gospelMaxChars: initialKit.familyMode?.gospelMaxChars ?? 150,
      familyPickMode:
        (initialKit.familyMode?.includedBlockIds?.length ?? 0) > 0 ? "manual" : "auto",
      includedStepIndexes: stepIndexesFromIncludedIds(
        initialKit.blocks,
        initialKit.familyMode?.includedBlockIds,
      ),
      blocks: initialKit.blocks,
    }),
  );

  const previewFamilyMode =
    familyPickMode === "manual" && includedStepIndexes.length > 0
      ? {
          gospelMaxChars,
          includedBlockIds: includedStepIndexes
            .map((i) => blocks[i]?.id)
            .filter((id): id is string => Boolean(id)),
        }
      : { gospelMaxChars };

  const save = useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      const blockRes = await fetch(`${apiBase}/${kit.id}/blocks`, {
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
      const savedBlocks = data.kit.blocks;

      const includedIds =
        familyPickMode === "manual"
          ? includedStepIndexes
              .map((i) => savedBlocks[i]?.id)
              .filter((id): id is string => Boolean(id))
          : [];

      const familyMode = buildFamilyModeConfig(gospelMaxChars, familyPickMode, includedIds);

      const res = await fetch(`${apiBase}/${kit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          gradeBand: gradeBand.trim() || null,
          tptUrl: tptUrl.trim() || null,
          isFreeSample,
          familyMode,
          ...(adminMeta
            ? {
                published,
                sortOrder,
                liturgicalPeriod: liturgicalPeriod.trim() || null,
              }
            : {
                communityVisible,
                authorDisplayName: authorDisplayName.trim() || null,
              }),
        }),
      });
      if (!res.ok) throw new Error("Could not save lesson details");

      const meta = (await res.json()) as { kit: LessonKitDto };
      setKit(meta.kit);
      setBlocks(meta.kit.blocks);
      setPublished(meta.kit.published);
      setCommunityVisible(meta.kit.communityVisible);
      setAuthorDisplayName(meta.kit.authorDisplayName ?? "");
      setSortOrder(meta.kit.sortOrder);
      setLiturgicalPeriod(meta.kit.liturgicalPeriod ?? "");
      setGospelMaxChars(meta.kit.familyMode?.gospelMaxChars ?? gospelMaxChars);
      const nextPickMode =
        (meta.kit.familyMode?.includedBlockIds?.length ?? 0) > 0 ? "manual" : "auto";
      setFamilyPickMode(nextPickMode);
      const nextIndexes = stepIndexesFromIncludedIds(
        meta.kit.blocks,
        meta.kit.familyMode?.includedBlockIds,
      );
      setIncludedStepIndexes(nextIndexes);

      lastSavedRef.current = snapshotKey({
        title,
        description,
        gradeBand: gradeBand.trim() || "",
        tptUrl: tptUrl.trim() || "",
        isFreeSample,
        published: meta.kit.published,
        communityVisible: meta.kit.communityVisible,
        authorDisplayName: meta.kit.authorDisplayName ?? "",
        sortOrder: meta.kit.sortOrder,
        liturgicalPeriod: liturgicalPeriod.trim() || "",
        gospelMaxChars: meta.kit.familyMode?.gospelMaxChars ?? gospelMaxChars,
        familyPickMode: nextPickMode,
        includedStepIndexes: nextIndexes,
        blocks: meta.kit.blocks,
      });
      setSaveState("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setSaveState("error");
    } finally {
      setSaving(false);
    }
  }, [
    apiBase,
    adminMeta,
    kit.id,
    title,
    description,
    gradeBand,
    tptUrl,
    isFreeSample,
    published,
    communityVisible,
    authorDisplayName,
    sortOrder,
    liturgicalPeriod,
    gospelMaxChars,
    familyPickMode,
    includedStepIndexes,
    blocks,
  ]);

  useEffect(() => {
    const snapshot = snapshotKey({
      title,
      description,
      gradeBand: gradeBand.trim() || "",
      tptUrl: tptUrl.trim() || "",
      isFreeSample,
      published,
      communityVisible,
      authorDisplayName: authorDisplayName.trim() || "",
      sortOrder,
      liturgicalPeriod: liturgicalPeriod.trim() || "",
      gospelMaxChars,
      familyPickMode,
      includedStepIndexes,
      blocks,
    });
    if (snapshot === lastSavedRef.current) return;

    setSaveState("dirty");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void save();
    }, AUTOSAVE_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [
    title,
    description,
    gradeBand,
    tptUrl,
    isFreeSample,
    published,
    communityVisible,
    authorDisplayName,
    sortOrder,
    liturgicalPeriod,
    gospelMaxChars,
    familyPickMode,
    includedStepIndexes,
    blocks,
    save,
  ]);

  const resolvedPrintHref =
    printHref === undefined ? `/program/kit/${kit.id}/print` : printHref;

  const breadcrumb =
    navItems ?? (adminMeta ? adminTemplateEditNavItems() : teacherEditNavItems());

  const deleteKit = async () => {
    if (adminMeta || kit.scope !== "PERSONAL") return;
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/${kit.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      router.push("/program");
      router.refresh();
    } catch {
      setError("Could not delete this lesson kit.");
      setDeleting(false);
    }
  };

  const addBlock = (type: LessonBlockType) => {
    setBlocks((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        sortOrder: prev.length,
        type,
        label: null,
        config: defaultBlockConfig(type),
      },
    ]);
    setShowAdd(false);
    setEditingIndex(blocks.length);
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
    setIncludedStepIndexes((prev) => remapIndexesOnRemove(prev, index));
    setEditingIndex((current) => {
      if (current === index) return null;
      if (current !== null && current > index) return current - 1;
      return current;
    });
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    setBlocks((prev) => {
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[index]!;
      next[index] = next[j]!;
      next[j] = tmp;
      return next;
    });
    setIncludedStepIndexes((prev) => remapIndexesOnMove(prev, index, j));
    setEditingIndex((current) => {
      if (current === null) return null;
      if (current === index) return j;
      if (current === j) return index;
      return current;
    });
  };

  const handlePickModeChange = (mode: FamilyPickMode) => {
    if (mode === "manual" && familyPickMode === "auto") {
      const indexes = blocks
        .map((b, i) => (isBlockIncludedInFamily(b, { gospelMaxChars }) ? i : -1))
        .filter((i) => i >= 0);
      setIncludedStepIndexes(indexes);
    }
    setFamilyPickMode(mode);
  };

  const toggleManualStep = (index: number) => {
    setIncludedStepIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index].sort((a, b) => a - b),
    );
  };

  const toggleAtHomeForStep = (index: number) => {
    if (familyPickMode === "manual") {
      toggleManualStep(index);
      return;
    }
    const block = blocks[index]!;
    const included = isBlockIncludedInFamily(block, previewFamilyMode);
    updateBlock(index, {
      ...block,
      config: { ...block.config, familyInclude: !included },
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
        <LessonKitNav items={breadcrumb} />
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
          {resolvedPrintHref ? (
            <Link
              href={resolvedPrintHref}
              className="text-sm font-semibold text-[var(--color-link)]"
            >
              Print
            </Link>
          ) : null}
        </div>
      </div>

      {adminMeta ? (
        <div className="flex flex-wrap items-center gap-4 rounded border border-[var(--color-border)] bg-[#fffaf5] px-4 py-3 text-sm">
          <label className="flex items-center gap-2 font-semibold text-[var(--color-ink)]">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published on /program
          </label>
          <label className="flex items-center gap-2 text-[var(--color-muted)]">
            Sort order
            <input
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className="w-20 border border-[var(--color-border)] px-2 py-1"
            />
          </label>
          <label className="flex min-w-[12rem] flex-1 items-center gap-2 text-[var(--color-muted)]">
            Liturgical period
            <input
              type="text"
              value={liturgicalPeriod}
              onChange={(e) => setLiturgicalPeriod(e.target.value)}
              placeholder="advent, lent, …"
              className="min-w-0 flex-1 border border-[var(--color-border)] px-2 py-1"
            />
          </label>
        </div>
      ) : null}

      <label className="block">
        <span className="text-sm font-semibold text-[var(--color-ink)]">Title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-lg font-bold"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-[var(--color-ink)]">Description (optional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-sm"
          placeholder="What your class will do this week"
        />
      </label>

      {!adminMeta ? (
        <div className="rounded border border-[var(--color-border)] bg-[#fffaf5] px-4 py-3 space-y-3">
          <label className="flex items-start gap-2 text-sm font-semibold text-[var(--color-ink)]">
            <input
              type="checkbox"
              className="mt-1"
              checked={communityVisible}
              onChange={(e) => setCommunityVisible(e.target.checked)}
            />
            <span>
              Share with other teachers
              <span className="mt-1 block text-xs font-normal text-[var(--color-muted)]">
                List this lesson on{" "}
                <a href="/program/community" className="font-semibold text-[var(--color-link)]">
                  /program/community
                </a>
                . Add a short description and grade band so others can find it. Your at-home family
                link settings are unchanged.
              </span>
            </span>
          </label>
          {communityVisible ? (
            <label className="block text-sm text-[var(--color-ink)]">
              <span className="font-semibold">Display name (optional)</span>
              <input
                type="text"
                value={authorDisplayName}
                onChange={(e) => setAuthorDisplayName(e.target.value)}
                className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-sm"
                placeholder="e.g. Mrs. Lopez, St. Mary’s Grade 3"
              />
            </label>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-[var(--color-ink)]">Grade band (optional)</span>
          <input
            type="text"
            value={gradeBand}
            onChange={(e) => setGradeBand(e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-sm"
            placeholder="e.g. Grades 2–4"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[var(--color-ink)]">TPT pack link (optional)</span>
          <input
            type="url"
            value={tptUrl}
            onChange={(e) => setTptUrl(e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-sm"
            placeholder="https://www.teacherspayteachers.com/..."
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
        <input
          type="checkbox"
          checked={isFreeSample}
          onChange={(e) => setIsFreeSample(e.target.checked)}
        />
        Show as free sample on this site (full pack on TPT)
      </label>

      <TptPartnerNote variant="inline" tptUrl={tptUrl || null} isFreeSample={isFreeSample} />

      <LessonFamilyModePanel
        shareSlug={kit.shareSlug}
        blocks={blocks}
        gospelMaxChars={gospelMaxChars}
        onGospelMaxCharsChange={setGospelMaxChars}
        pickMode={familyPickMode}
        onPickModeChange={handlePickModeChange}
        includedStepIndexes={includedStepIndexes}
        onToggleManualStep={toggleManualStep}
      />

      <ul className="space-y-2">
        {blocks.map((block, index) => {
          const atHome = isBlockIncludedInFamily(block, previewFamilyMode);
          return (
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
              <button
                type="button"
                onClick={() => toggleAtHomeForStep(index)}
                className={`lesson-family-pill ${atHome ? "lesson-family-pill--on" : ""}`}
                title={atHome ? "Included in at-home link" : "Class only"}
              >
                <LessonIcon name="home" size="sm" />
                <span className="sr-only">{atHome ? "At home" : "Class only"}</span>
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
                familyPickMode={familyPickMode}
                onChange={(next) => updateBlock(index, next)}
                onClose={() => setEditingIndex(null)}
              />
            ) : null}
          </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => setShowAdd(true)}
        className="w-full border border-dashed border-[var(--color-border)] py-3 text-sm font-bold text-[var(--color-muted)] hover:border-[var(--color-accent)]"
      >
        + Add puzzle piece
      </button>

      {showAdd ? (
        <LessonBlockPalette onPick={addBlock} onCancel={() => setShowAdd(false)} />
      ) : null}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <LessonBigButton onClick={() => void save()} disabled={saving}>
        {saving ? "Saving…" : "Save now"}
      </LessonBigButton>

      <LessonShareSheet shareSlug={kit.shareSlug} title={kit.title} />

      {!adminMeta && kit.scope === "PERSONAL" ? (
        <button
          type="button"
          disabled={deleting || saving}
          onClick={() => void deleteKit()}
          className="lesson-kit-editor__delete"
        >
          {deleting ? "Deleting…" : "Delete this kit"}
        </button>
      ) : null}

      <details className="text-xs text-[var(--color-muted)]">
        <summary className="cursor-pointer font-semibold">Presets reference</summary>
        <p className="mt-2">Word presets: {Object.keys(LESSON_WORD_PRESETS).join(", ")}</p>
        <p className="mt-1">Games: {LESSON_GAME_SLUGS.map((g) => g.slug).join(", ")}</p>
      </details>
    </div>
  );
}
