"use client";

import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { isHtmlContent } from "@/lib/content-html";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type CurriculumFormData = {
  id?: string;
  title: string;
  slug: string;
  stage: string;
  description: string;
  body: string;
  bodyFormat?: string;
  lessonCount: number;
  sortOrder: number;
  published: boolean;
};

type Props = { initial?: CurriculumFormData };

export function CurriculumEditor({ initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<CurriculumFormData>(
    initial ?? {
      title: "",
      slug: "",
      stage: "Stage 1",
      description: "",
      body: "",
      lessonCount: 0,
      sortOrder: 0,
      published: true,
    },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof CurriculumFormData>(key: K, value: CurriculumFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isEdit
        ? `/api/admin/curriculum/${initial!.id}`
        : "/api/admin/curriculum";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      router.push("/admin/curriculum");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!initial?.id || !confirm("Delete this curriculum track?")) return;
    await fetch(`/api/admin/curriculum/${initial.id}`, { method: "DELETE" });
    router.push("/admin/curriculum");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 border border-[var(--color-border)] bg-white p-6">
      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
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
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Stage label
        <input
          value={form.stage}
          onChange={(e) => update("stage", e.target.value)}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <label className="block text-sm font-semibold">
        Short description
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        />
      </label>
      <div>
        <p className="text-sm font-semibold">Track overview (optional)</p>
        <div className="mt-2">
          <RichTextEditor
            value={isHtmlContent(form.body, form.bodyFormat) ? form.body : form.body ? `<p>${form.body}</p>` : "<p></p>"}
            onChange={(html) => update("body", html)}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Lesson count
          <input
            type="number"
            min={0}
            value={form.lessonCount}
            onChange={(e) => update("lessonCount", Number(e.target.value))}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          />
        </label>
        <label className="block text-sm font-semibold">
          Sort order
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => update("sortOrder", Number(e.target.value))}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => update("published", e.target.checked)}
        />
        Published
      </label>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-[var(--color-accent)] px-6 py-2 text-sm font-bold text-white"
        >
          {saving ? "Saving…" : isEdit ? "Save" : "Create track"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={() => void onDelete()}
            className="border border-red-300 px-6 py-2 text-sm text-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
