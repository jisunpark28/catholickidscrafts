"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type ChurchDecorationFormData = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  posX: number;
  posY: number;
  posZ: number;
  width: number;
  height: number;
  rotationY: number;
  sortOrder: number;
  published: boolean;
};

type Props = { initial?: ChurchDecorationFormData };

export function ChurchDecorationEditor({ initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<ChurchDecorationFormData>(
    initial ?? {
      title: "",
      slug: "",
      description: "",
      imageUrl: "",
      posX: 0,
      posY: 2.2,
      posZ: -6,
      width: 1.4,
      height: 1.4,
      rotationY: 0,
      sortOrder: 0,
      published: true,
    },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function update<K extends keyof ChurchDecorationFormData>(
    key: K,
    value: ChurchDecorationFormData[K],
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
        ? `/api/admin/church-decorations/${initial!.id}`
        : "/api/admin/church-decorations";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      router.push("/admin/church-decorations");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!initial?.id || !confirm("Delete this church decoration?")) return;
    const res = await fetch(`/api/admin/church-decorations/${initial.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    router.push("/admin/church-decorations");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 border border-[var(--color-border)] bg-white p-6">
      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <p className="text-sm text-[var(--color-muted)]">
        Place images inside the 3D church. Use{" "}
        <a href="/play/church" target="_blank" rel="noopener noreferrer" className="text-[var(--color-link)]">
          Play → Church
        </a>{" "}
        to test positions. Negative Z is toward the altar; Y is height.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Title *
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          />
        </label>
        <label className="block text-sm font-semibold">
          Slug
          <input
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="auto-from-title"
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          />
        </label>
      </div>

      <label className="block text-sm font-semibold">
        Description (shown when visitors click the image)
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        />
      </label>

      <fieldset className="border border-[var(--color-border)] p-4">
        <legend className="px-2 text-sm font-semibold">Image</legend>
        <label className="text-sm">
          Upload PNG or JPG
          <input
            type="file"
            accept="image/*"
            className="mt-1 block"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadFile(f);
            }}
            disabled={uploading}
          />
        </label>
        {uploading && <p className="text-sm text-[var(--color-muted)]">Uploading…</p>}
        <label className="mt-3 block text-sm font-semibold">
          Image URL *
          <input
            required
            type="url"
            value={form.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          />
        </label>
        {form.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.imageUrl} alt="" className="mt-3 max-h-40 border border-[var(--color-border)]" />
        )}
      </fieldset>

      <fieldset className="border border-[var(--color-border)] p-4">
        <legend className="px-2 text-sm font-semibold">Position in church (3D)</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["posX", "X (left/right)"],
              ["posY", "Y (height)"],
              ["posZ", "Z (toward altar)"],
              ["width", "Width"],
              ["height", "Height"],
              ["rotationY", "Rotation Y"],
              ["sortOrder", "Sort order"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm font-semibold">
              {label}
              <input
                type="number"
                step={key.startsWith("pos") || key === "rotationY" ? "0.1" : "1"}
                value={form[key]}
                onChange={(e) => update(key, Number(e.target.value))}
                className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => update("published", e.target.checked)}
        />
        Published (visible in church game)
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-[var(--color-accent)] px-6 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Save" : "Create"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={() => void onDelete()}
            className="border border-red-300 px-6 py-2 text-sm font-semibold text-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
