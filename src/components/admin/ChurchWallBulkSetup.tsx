"use client";

import { CHURCH_WALL_SLOTS, getChurchWallSlot } from "@/lib/church-wall-slots";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type ChurchDecorationRow = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  width: number;
  height: number;
  published: boolean;
};

export type WallSlotDraft = {
  sortOrder: number;
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  width: number;
  height: number;
  published: boolean;
};

function defaultTitle(sortOrder: number): string {
  const slot = getChurchWallSlot(sortOrder);
  if (!slot) return `Wall ${sortOrder + 1}`;
  return `${slot.side === "left" ? "Left" : "Right"} ${slot.row + 1}`;
}

function buildDrafts(existing: ChurchDecorationRow[]): WallSlotDraft[] {
  const bySort = new Map<number, ChurchDecorationRow>();
  for (const row of existing) {
    if (row.sortOrder >= 0 && row.sortOrder <= 13 && !bySort.has(row.sortOrder)) {
      bySort.set(row.sortOrder, row);
    }
  }

  return CHURCH_WALL_SLOTS.map((slot) => {
    const prev = bySort.get(slot.sortOrder);
    return {
      sortOrder: slot.sortOrder,
      id: prev?.id,
      title: prev?.title ?? defaultTitle(slot.sortOrder),
      description: prev?.description ?? "",
      imageUrl: prev?.imageUrl ?? "",
      width: prev?.width ?? slot.width,
      height: prev?.height ?? slot.height,
      published: prev?.published ?? true,
    };
  });
}

type Props = { initialItems: ChurchDecorationRow[] };

export function ChurchWallBulkSetup({ initialItems }: Props) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<WallSlotDraft[]>(() => buildDrafts(initialItems));
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  const filledCount = useMemo(
    () => drafts.filter((d) => d.imageUrl.trim().length > 0).length,
    [drafts],
  );

  function updateSlot(sortOrder: number, patch: Partial<WallSlotDraft>) {
    setDrafts((prev) => prev.map((d) => (d.sortOrder === sortOrder ? { ...d, ...patch } : d)));
  }

  async function uploadForSlot(sortOrder: number, file: File) {
    setUploadingSlot(sortOrder);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      const name = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
      updateSlot(sortOrder, {
        imageUrl: data.url,
        ...(name.length > 0 && drafts.find((d) => d.sortOrder === sortOrder)?.title === defaultTitle(sortOrder)
          ? { title: name.slice(0, 80) }
          : {}),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingSlot(null);
    }
  }

  function clearSlot(sortOrder: number) {
    const slot = getChurchWallSlot(sortOrder);
    updateSlot(sortOrder, {
      imageUrl: "",
      title: defaultTitle(sortOrder),
      description: "",
      width: slot?.width ?? 1.12,
      height: slot?.height ?? 1.48,
    });
  }

  async function saveAll() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/church-decorations/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: drafts }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      }
      setMessage(
        `Saved. ${data.created} added, ${data.updated} updated${data.removed > 0 ? `, ${data.removed} removed` : ""}.`,
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function renderSlotPanel(draft: WallSlotDraft) {
    const slot = getChurchWallSlot(draft.sortOrder)!;
    const hasImage = draft.imageUrl.trim().length > 0;

    return (
      <div
        key={draft.sortOrder}
        className={`rounded border-2 bg-white p-3 ${
          hasImage ? "border-[var(--color-accent)]" : "border-[var(--color-border)]"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]">
            {slot.label}
          </p>
          <span className="text-[10px] font-bold text-[var(--color-muted)]">
            {slot.side === "left" ? "L" : "R"}
            {slot.row + 1}
          </span>
        </div>

        <div className="mt-2 flex min-h-[100px] items-center justify-center border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={draft.imageUrl}
              alt=""
              className="max-h-28 w-full object-contain p-1"
            />
          ) : (
            <span className="px-2 text-center text-xs text-[var(--color-muted)]">No image</span>
          )}
        </div>

        <label className="mt-2 block text-xs font-semibold">
          Upload
          <input
            type="file"
            accept="image/*"
            disabled={uploadingSlot !== null}
            className="mt-1 block w-full text-xs"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadForSlot(draft.sortOrder, f);
              e.target.value = "";
            }}
          />
        </label>
        {uploadingSlot === draft.sortOrder && (
          <p className="text-xs text-[var(--color-muted)]">Uploading…</p>
        )}

        <label className="mt-2 block text-xs font-semibold">
          Title
          <input
            value={draft.title}
            onChange={(e) => updateSlot(draft.sortOrder, { title: e.target.value })}
            className="mt-1 w-full border border-[var(--color-border)] px-2 py-1 text-sm"
          />
        </label>

        <label className="mt-2 block text-xs font-semibold">
          Click description (optional)
          <textarea
            value={draft.description}
            onChange={(e) => updateSlot(draft.sortOrder, { description: e.target.value })}
            rows={2}
            className="mt-1 w-full border border-[var(--color-border)] px-2 py-1 text-sm"
            placeholder="Shown when kids tap the picture in church"
          />
        </label>

        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <label className="flex items-center gap-1 font-semibold">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => updateSlot(draft.sortOrder, { published: e.target.checked })}
            />
            Live
          </label>
          {draft.id && (
            <Link
              href={`/admin/church-decorations/${draft.id}/edit`}
              className="font-semibold text-[var(--color-link)]"
            >
              Advanced edit
            </Link>
          )}
          <button
            type="button"
            onClick={() => clearSlot(draft.sortOrder)}
            className="font-semibold text-red-700"
          >
            Clear
          </button>
        </div>
      </div>
    );
  }

  const leftDrafts = drafts.filter((d) => d.sortOrder < 7);
  const rightDrafts = drafts.filter((d) => d.sortOrder >= 7);

  return (
    <div className="space-y-6">
      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {message && (
        <p className="border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {message}
        </p>
      )}

      <p className="text-sm text-[var(--color-muted)]">
        Set all <strong className="text-[var(--color-ink)]">14 wall frames</strong> in one pass—upload
        an image for each slot, add a title and optional description, then save once. Matches{" "}
        <a
          href="/play/church"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--color-link)]"
        >
          Play → Church
        </a>
        . Empty slots are removed if they had a picture before.
      </p>

      <div className="overflow-x-auto rounded border border-[var(--color-border)] bg-gradient-to-b from-[#1a1612] to-[#2a241c] p-4">
        <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-[#e8dcc8]">
          Sanctuary · altar &amp; cross (top = church doors)
        </p>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <div>
            <p className="mb-3 text-center text-sm font-bold text-[#e8dcc8]">Left wall · 7 frames</p>
            <div className="space-y-3">{leftDrafts.map(renderSlotPanel)}</div>
          </div>
          <div className="hidden items-center justify-center lg:flex">
            <p className="text-xs text-[#c4b59a]">Nave</p>
          </div>
          <div>
            <p className="mb-3 text-center text-sm font-bold text-[#e8dcc8]">Right wall · 7 frames</p>
            <div className="space-y-3">{rightDrafts.map(renderSlotPanel)}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <button
          type="button"
          disabled={saving || filledCount === 0}
          onClick={() => void saveAll()}
          className="bg-[var(--color-accent)] px-6 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : `Save all (${filledCount} with images)`}
        </button>
        <p className="text-sm text-[var(--color-muted)]">
          {filledCount} of 14 slots have images
        </p>
        <Link
          href="/admin/church-decorations"
          className="text-sm font-semibold text-[var(--color-link)]"
        >
          Back to list
        </Link>
      </div>
    </div>
  );
}
