"use client";

import type { PhotoBoothLayout } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type PhotoBoothFrameFormData = {
  id?: string;
  title: string;
  slug: string;
  imageUrl: string;
  layout: PhotoBoothLayout;
  sortOrder: number;
  published: boolean;
};

type Props = { initial?: PhotoBoothFrameFormData };

const LAYOUT_OPTIONS: { value: PhotoBoothLayout; label: string }[] = [
  { value: "BOTH", label: "Single + 4-cut strip" },
  { value: "SINGLE", label: "Single photo only" },
  { value: "STRIP", label: "4-cut strip only" },
];

export function PhotoBoothFrameEditor({ initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<PhotoBoothFrameFormData>(
    initial ?? {
      title: "",
      slug: "",
      imageUrl: "",
      layout: "BOTH",
      sortOrder: 0,
      published: true,
    },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function update<K extends keyof PhotoBoothFrameFormData>(
    key: K,
    value: PhotoBoothFrameFormData[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      update("imageUrl", data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isEdit
        ? `/api/admin/photo-booth-frames/${initial!.id}`
        : "/api/admin/photo-booth-frames";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      router.push("/admin/photo-booth-frames");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!initial?.id || !confirm("Delete this photo booth frame?")) return;
    const res = await fetch(`/api/admin/photo-booth-frames/${initial.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    router.push("/admin/photo-booth-frames");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 border border-[var(--color-border)] bg-white p-6">
      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <p className="text-sm text-[var(--color-muted)]">
        Upload a <strong className="font-medium text-[var(--color-ink)]">PNG with transparency</strong>{" "}
        sized for one photo slot (360×480 px for single; same ratio for each 4-cut cell). The frame is
        drawn <strong className="font-medium text-[var(--color-ink)]">on top of each photo</strong> and
        under stickers. Test in{" "}
        <a
          href="/play/photo-booth"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-link)]"
        >
          Play → 4-Cut Photo Booth
        </a>
        .
      </p>

      <label className="block text-sm font-semibold">
        Title
        <input
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        />
      </label>

      <label className="block text-sm font-semibold">
        Slug (optional)
        <input
          value={form.slug}
          onChange={(e) => update("slug", e.target.value)}
          placeholder="auto from title"
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        />
      </label>

      <label className="block text-sm font-semibold">
        Show in
        <select
          value={form.layout}
          onChange={(e) => update("layout", e.target.value as PhotoBoothLayout)}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        >
          {LAYOUT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <div>
        <p className="text-sm font-semibold">Frame image (PNG)</p>
        {form.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.imageUrl}
            alt="Frame preview"
            className="mt-2 max-h-48 border border-[var(--color-border)] bg-[var(--color-surface)] object-contain"
          />
        )}
        <input
          type="file"
          accept="image/png,image/webp"
          className="mt-2 block text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void uploadFile(f);
          }}
          disabled={uploading}
        />
        {uploading && <p className="text-sm text-[var(--color-muted)]">Uploading…</p>}
      </div>

      <label className="block text-sm font-semibold">
        Sort order
        <input
          type="number"
          value={form.sortOrder}
          onChange={(e) => update("sortOrder", Number(e.target.value) || 0)}
          className="mt-1 w-24 border border-[var(--color-border)] px-3 py-2"
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => update("published", e.target.checked)}
        />
        Published
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving || !form.imageUrl}
          className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save frame"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={() => void onDelete()}
            className="border border-red-300 px-4 py-2 text-sm font-bold text-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
