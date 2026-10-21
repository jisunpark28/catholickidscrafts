"use client";

import { LITURGY_TOPICS, LITURGY_TOPIC_LABELS } from "@/lib/liturgy-topics";
import { WEEKLY_COLORS, WEEKLY_ITEM_TYPES, WEEKLY_ITEM_TYPE_LABELS } from "@/lib/weekly-content";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ItemForm = {
  key: string;
  title: string;
  type: string;
  fileUrl: string;
  thumbUrl: string;
  topic: string;
};

export type WeeklyIssueFormData = {
  id?: string;
  sundayDate: string;
  title: string;
  season: string;
  cycle: string;
  gospelRef: string;
  color: string;
  published: boolean;
  items: ItemForm[];
};

const IMAGE_TYPES = /^image\/(png|jpe?g|webp|gif)$/;

function titleFromFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

async function upload(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return data.url as string;
}

const inputClass = "mt-1 w-full border border-[var(--color-border)] px-3 py-2";

export function WeeklyIssueEditor({ initial }: { initial?: WeeklyIssueFormData }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<WeeklyIssueFormData>(
    initial ?? {
      sundayDate: "",
      title: "",
      season: "",
      cycle: "",
      gospelRef: "",
      color: "",
      published: false,
      items: [],
    },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);

  function update<K extends keyof WeeklyIssueFormData>(key: K, value: WeeklyIssueFormData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateItem(key: string, patch: Partial<ItemForm>) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    }));
  }

  function moveItem(index: number, delta: number) {
    setForm((current) => {
      const items = [...current.items];
      const target = index + delta;
      if (target < 0 || target >= items.length) return current;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...current, items };
    });
  }

  function removeItem(key: string) {
    setForm((current) => ({ ...current, items: current.items.filter((item) => item.key !== key) }));
  }

  async function addFiles(files: FileList) {
    setError("");
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    await Promise.all(
      list.map(async (file) => {
        try {
          const url = await upload(file);
          const isImage = IMAGE_TYPES.test(file.type);
          setForm((current) => ({
            ...current,
            items: [
              ...current.items,
              {
                key: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                title: titleFromFilename(file.name) || "Untitled",
                type: "coloring",
                fileUrl: url,
                thumbUrl: isImage ? url : "",
                topic: "",
              },
            ],
          }));
        } catch (e) {
          setError(`${file.name}: ${e instanceof Error ? e.message : "Upload failed"}`);
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
  }

  async function uploadThumb(key: string, file: File) {
    setError("");
    setUploading((n) => n + 1);
    try {
      updateItem(key, { thumbUrl: await upload(file) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading((n) => n - 1);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        sundayDate: form.sundayDate,
        title: form.title,
        season: form.season,
        cycle: form.cycle,
        gospelRef: form.gospelRef,
        color: form.color,
        published: form.published,
        items: form.items.map((item) => ({
          title: item.title,
          type: item.type,
          fileUrl: item.fileUrl,
          thumbUrl: item.thumbUrl,
          topic: item.topic || null,
        })),
      };
      const res = await fetch(isEdit ? `/api/admin/weekly/${initial!.id}` : "/api/admin/weekly", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      if (!isEdit) router.push(`/admin/weekly/${data.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!initial?.id || !confirm("Delete this weekly issue and all its items?")) return;
    const res = await fetch(`/api/admin/weekly/${initial.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    router.push("/admin/weekly");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <section className="grid gap-4 border border-[var(--color-border)] bg-white p-6 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Sunday date
          <input
            type="date"
            required
            value={form.sundayDate}
            onChange={(e) => update("sundayDate", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-semibold">
          Title
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            maxLength={160}
            placeholder="30th Sunday in Ordinary Time"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-semibold">
          Season
          <input
            value={form.season}
            onChange={(e) => update("season", e.target.value)}
            maxLength={80}
            placeholder="Ordinary Time"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-semibold">
          Cycle
          <select
            value={form.cycle}
            onChange={(e) => update("cycle", e.target.value)}
            className={inputClass}
          >
            <option value="">-</option>
            <option value="A">Year A</option>
            <option value="B">Year B</option>
            <option value="C">Year C</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Gospel
          <input
            value={form.gospelRef}
            onChange={(e) => update("gospelRef", e.target.value)}
            maxLength={80}
            placeholder="Matthew 22:34-40"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-semibold">
          Liturgical color
          <input
            list="weekly-colors"
            value={form.color}
            onChange={(e) => update("color", e.target.value)}
            maxLength={40}
            placeholder="green"
            className={inputClass}
          />
          <datalist id="weekly-colors">
            {Object.keys(WEEKLY_COLORS).map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update("published", e.target.checked)}
          />
          Published (visible on the site)
        </label>
      </section>

      <section className="border border-[var(--color-border)] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Items</h2>
          <label className="cursor-pointer border border-[var(--color-border)] px-3 py-2 text-sm font-semibold">
            Add files (PDF or images)
            <input
              type="file"
              multiple
              accept="application/pdf,image/png,image/jpeg,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => {
                if (e.target.files?.length) void addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {uploading > 0 && (
          <p className="mt-2 text-sm text-[var(--color-muted)]">Uploading {uploading} file(s)...</p>
        )}
        {form.items.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            No items yet. Each uploaded file becomes one card.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {form.items.map((item, index) => (
              <li
                key={item.key}
                className="grid gap-4 border border-[var(--color-border)] p-4 sm:grid-cols-[96px_1fr_auto]"
              >
                <div>
                  {item.thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbUrl}
                      alt=""
                      className="h-24 w-24 rounded-lg border border-dashed border-[#d9d3cb] object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-[#d9d3cb] text-xs text-[var(--color-muted)]">
                      No thumbnail
                    </div>
                  )}
                  <label className="mt-2 block cursor-pointer text-xs font-semibold text-[var(--color-link)]">
                    {item.thumbUrl ? "Change" : "Add"} thumbnail
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadThumb(item.key, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block text-sm font-semibold sm:col-span-3">
                    Title
                    <input
                      required
                      value={item.title}
                      maxLength={160}
                      onChange={(e) => updateItem(item.key, { title: e.target.value })}
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-sm font-semibold">
                    Type
                    <select
                      value={item.type}
                      onChange={(e) => updateItem(item.key, { type: e.target.value })}
                      className={inputClass}
                    >
                      {WEEKLY_ITEM_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {WEEKLY_ITEM_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold">
                    Topic page
                    <select
                      value={item.topic}
                      onChange={(e) => updateItem(item.key, { topic: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">None (This week only)</option>
                      {LITURGY_TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {LITURGY_TOPIC_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-end truncate pb-2 text-sm text-[var(--color-link)]"
                  >
                    Open file
                  </a>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <button
                    type="button"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                    className="border border-[var(--color-border)] px-2 py-1 text-sm disabled:opacity-40"
                  >
                    &uarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === form.items.length - 1}
                    aria-label="Move down"
                    className="border border-[var(--color-border)] px-2 py-1 text-sm disabled:opacity-40"
                  >
                    &darr;
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="px-2 py-1 text-sm font-semibold text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving || uploading > 0}
          className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Save issue" : "Create issue"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={() => void onDelete()}
            className="border border-[var(--color-border)] px-4 py-2 text-sm font-semibold"
          >
            Delete issue
          </button>
        )}
      </div>
    </form>
  );
}