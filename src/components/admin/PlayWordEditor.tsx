"use client";

import type { PlayWordsAdminConfig } from "@/lib/play-words-admin-config";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type PlayWordFormData = {
  id?: string;
  word: string;
  hint: string;
  sortOrder: number;
  published: boolean;
};

type Props = {
  config: PlayWordsAdminConfig;
  initial?: PlayWordFormData;
};

export function PlayWordEditor({ config, initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<PlayWordFormData>(
    initial ?? {
      word: "",
      hint: "",
      sortOrder: 0,
      published: true,
    },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof PlayWordFormData>(key: K, value: PlayWordFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `${config.apiBase}/${initial!.id}` : config.apiBase;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      router.push(config.adminListPath);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!initial?.id || !confirm(`Delete this ${config.deleteConfirmLabel}?`)) return;
    const res = await fetch(`${config.apiBase}/${initial.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    router.push(config.adminListPath);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 border border-[var(--color-border)] bg-white p-6">
      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <p className="text-sm text-[var(--color-muted)]">
        {config.intro}{" "}
        <a
          href={config.playHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-link)]"
        >
          {config.playLabel}
        </a>
        . {config.wordNote}
      </p>

      <label className="block text-sm font-semibold">
        Word
        <input
          required
          value={form.word}
          onChange={(e) => update("word", e.target.value)}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          maxLength={64}
        />
      </label>

      <label className="block text-sm font-semibold">
        Hint (optional)
        <input
          value={form.hint}
          onChange={(e) => update("hint", e.target.value)}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          placeholder="e.g. God’s gift of life"
          maxLength={200}
        />
      </label>

      <label className="block text-sm font-semibold">
        Sort order
        <input
          type="number"
          value={form.sortOrder}
          onChange={(e) => update("sortOrder", Number(e.target.value))}
          className="mt-1 w-32 border border-[var(--color-border)] px-3 py-2"
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
          disabled={saving}
          className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={onDelete}
            className="border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
