"use client";

import { LITURGY_TOPICS, LITURGY_TOPIC_LABELS, type LiturgyTopic } from "@/lib/liturgy-topics";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type LiturgyCardFormData = {
  id?: string;
  topic: LiturgyTopic;
  title: string;
  href: string;
  imageUrl: string;
  sortOrder: number;
};

type Props = {
  initial?: LiturgyCardFormData;
  topic?: LiturgyTopic;
};

export function LiturgyCardEditor({ initial, topic = "mass" }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<LiturgyCardFormData>(
    initial ?? {
      topic,
      title: "",
      href: "",
      imageUrl: "",
      sortOrder: 0,
    },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function update<K extends keyof LiturgyCardFormData>(key: K, value: LiturgyCardFormData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
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
      const url = isEdit ? `/api/admin/liturgy-cards/${initial!.id}` : "/api/admin/liturgy-cards";
      const payload = isEdit
        ? form
        : {
            topic: form.topic,
            title: form.title,
            href: form.href,
            imageUrl: form.imageUrl,
          };
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : "Save failed. Check the link and image.";
        throw new Error(message);
      }
      if (isEdit) {
        router.push(`/admin/liturgy-cards?topic=${data.topic}`);
      } else {
        setForm((current) => ({ ...current, title: "", href: "", imageUrl: "" }));
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!initial?.id || !confirm("Delete this liturgy card?")) return;
    const res = await fetch(`/api/admin/liturgy-cards/${initial.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    router.push(`/admin/liturgy-cards?topic=${form.topic}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-[var(--color-border)] bg-white p-6">
      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <label className="block text-sm font-semibold">
        Topic
        <select
          value={form.topic}
          onChange={(e) => update("topic", e.target.value as LiturgyTopic)}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        >
          {LITURGY_TOPICS.map((value) => (
            <option key={value} value={value}>
              {LITURGY_TOPIC_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-semibold">
        Title
        <input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          maxLength={120}
          placeholder="Short title, optional"
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        />
      </label>

      <label className="block text-sm font-semibold">
        Link
        <input
          required
          value={form.href}
          onChange={(e) => update("href", e.target.value)}
          placeholder="https://www.teacherspayteachers.com/… or /resources/…"
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        />
      </label>

      <div>
        <label className="block text-sm font-semibold">
          Image URL
          <input
            value={form.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            placeholder="/images/… or https://…"
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          />
        </label>
        {form.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.imageUrl}
            alt=""
            className="mt-3 h-28 w-28 rounded-xl border border-dashed border-[#d9d3cb] object-cover"
          />
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="mt-2 block text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file);
          }}
          disabled={uploading}
        />
        {uploading && <p className="text-sm text-[var(--color-muted)]">Uploading…</p>}
      </div>

      {isEdit && (
        <label className="block text-sm font-semibold">
          Sort order
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => update("sortOrder", Number(e.target.value))}
            className="mt-1 w-32 border border-[var(--color-border)] px-3 py-2"
          />
        </label>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Save card" : "Add card"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={() => void onDelete()}
            className="border border-[var(--color-border)] px-4 py-2 text-sm font-semibold"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
