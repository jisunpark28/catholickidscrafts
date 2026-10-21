"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type QaCardForm = {
  question: string;
  answer: string;
  tryThis: string;
  iconFallback: string;
  imageFilename: string;
  imageUrl: string;
  imageScene: string;
  imagePrompt: string;
  altText: string;
  cardColor: string;
  status: "DRAFT" | "PUBLISHED";
  internalSourceRef: string;
  reviewNote: string;
};

const EMPTY: QaCardForm = {
  question: "",
  answer: "",
  tryThis: "",
  iconFallback: "",
  imageFilename: "",
  imageUrl: "",
  imageScene: "",
  imagePrompt: "",
  altText: "",
  cardColor: "#FFE3CC",
  status: "DRAFT",
  internalSourceRef: "",
  reviewNote: "",
};

type Props = { id?: string; topicSlug: string; initial?: QaCardForm };

const input = "mt-1 w-full border border-[var(--color-border)] px-3 py-2 font-normal";

export function LiturgyQaCardEditor({ id, topicSlug, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<QaCardForm>(initial ?? EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isPrayer = topicSlug === "prayers";

  function update<K extends keyof QaCardForm>(key: K, value: QaCardForm[K]) {
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
      const res = await fetch(id ? `/api/admin/liturgy-qa/cards/${id}` : "/api/admin/liturgy-qa/cards", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? form : { ...form, topicSlug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      router.push(`/admin/liturgy-qa?topic=${topicSlug}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-[var(--color-border)] bg-white p-6">
      {error && <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <fieldset className="space-y-4">
        <legend className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">Shown on the site</legend>
        <label className="block text-sm font-semibold">
          {isPrayer ? "Prayer name (front)" : "Question (front)"}
          <input required maxLength={200} value={form.question} onChange={(e) => update("question", e.target.value)} className={input} />
        </label>
        <label className="block text-sm font-semibold">
          {isPrayer ? "Full prayer text (back)" : "Answer (back, 3-4 short sentences)"}
          <textarea required maxLength={4000} rows={isPrayer ? 10 : 4} value={form.answer} onChange={(e) => update("answer", e.target.value)} className={input} />
        </label>
        <label className="block text-sm font-semibold">
          {isPrayer ? "When we pray it (front, one line)" : "Try this (activity chip)"}
          <input maxLength={300} value={form.tryThis} onChange={(e) => update("tryThis", e.target.value)} className={input} />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="block text-sm font-semibold">
            Emoji fallback
            <input maxLength={16} value={form.iconFallback} onChange={(e) => update("iconFallback", e.target.value)} className={input} />
          </label>
          <label className="block text-sm font-semibold">
            Card colour
            <input value={form.cardColor} onChange={(e) => update("cardColor", e.target.value)} placeholder="#FFE3CC" className={input} />
          </label>
          <label className="block text-sm font-semibold">
            Status
            <select value={form.status} onChange={(e) => update("status", e.target.value as QaCardForm["status"])} className={input}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </label>
        </div>
        <div>
          <label className="block text-sm font-semibold">
            Image URL
            <input value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="/images/… or https://…" className={input} />
          </label>
          {form.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imageUrl} alt="" className="mt-3 h-24 w-32 rounded-xl object-cover" />
          )}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="mt-2 block text-sm" disabled={uploading}
            onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadFile(file); }} />
          {uploading && <p className="text-sm text-[var(--color-muted)]">Uploading…</p>}
        </div>
        <label className="block text-sm font-semibold">
          Alt text
          <input maxLength={400} value={form.altText} onChange={(e) => update("altText", e.target.value)} className={input} />
        </label>
      </fieldset>

      <fieldset className="space-y-4 border-t border-dashed border-[var(--color-border)] pt-4">
        <legend className="text-xs font-bold uppercase tracking-wide text-amber-800">Admin only (never shown on the site)</legend>
        <label className="block text-sm font-semibold">
          Image file name
          <input maxLength={160} value={form.imageFilename} onChange={(e) => update("imageFilename", e.target.value)} className={input} />
        </label>
        <label className="block text-sm font-semibold">
          Image scene
          <textarea rows={2} maxLength={1000} value={form.imageScene} onChange={(e) => update("imageScene", e.target.value)} className={input} />
        </label>
        <label className="block text-sm font-semibold">
          Image prompt
          <textarea rows={3} maxLength={3000} value={form.imagePrompt} onChange={(e) => update("imagePrompt", e.target.value)} className={input} />
        </label>
        <label className="block text-sm font-semibold">
          Internal source ref
          <input maxLength={300} value={form.internalSourceRef} onChange={(e) => update("internalSourceRef", e.target.value)} className={input} />
        </label>
        <label className="block text-sm font-semibold">
          Review note
          <textarea rows={2} maxLength={1000} value={form.reviewNote} onChange={(e) => update("reviewNote", e.target.value)} className={input} />
        </label>
      </fieldset>

      <button type="submit" disabled={saving || uploading} className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
        {saving ? "Saving…" : id ? "Save card" : "Add card"}
      </button>
    </form>
  );
}
