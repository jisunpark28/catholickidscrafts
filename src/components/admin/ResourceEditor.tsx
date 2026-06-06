"use client";

import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { isHtmlContent } from "@/lib/content-html";
import { LITURGICAL_PERIODS } from "@/lib/content-types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type ResourceFormData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentFormat?: string;
  grade: string;
  topic: string;
  liturgicalPeriod: string;
  downloadLabel: string;
  downloadUrl: string;
  tptUrl: string;
  isFreeSample: boolean;
  previewImageUrl: string;
  published: boolean;
};

type Props = {
  initial?: ResourceFormData;
  /** Curriculum track `title` values for the Title dropdown. */
  titleOptions: string[];
};

function titleDropdownOptions(titleOptions: string[], currentGrade: string): string[] {
  const trimmed = currentGrade.trim();
  if (!trimmed || titleOptions.includes(trimmed)) return titleOptions;
  return [trimmed, ...titleOptions];
}

export function ResourceEditor({ initial, titleOptions }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const defaultGrade = titleOptions[0] ?? "";
  const [form, setForm] = useState<ResourceFormData>(
    initial ?? {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      grade: defaultGrade,
      topic: "General",
      liturgicalPeriod: "general",
      downloadLabel: "",
      downloadUrl: "",
      tptUrl: "",
      isFreeSample: true,
      previewImageUrl: "",
      published: true,
    },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function update<K extends keyof ResourceFormData>(key: K, value: ResourceFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadFile(file: File, target: "downloadUrl" | "previewImageUrl") {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      update(target, data.url);
      if (target === "downloadUrl" && !form.downloadLabel) {
        update("downloadLabel", "Download free sample");
      }
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
    const payload = {
      ...form,
      contentFormat: "html",
      downloadLabel: form.downloadLabel || null,
      downloadUrl: form.downloadUrl || null,
      tptUrl: form.tptUrl || null,
      previewImageUrl: form.previewImageUrl || null,
    };
    try {
      const url = isEdit
        ? `/api/admin/resources/${initial!.id}`
        : "/api/admin/resources";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push("/admin/resources");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!initial?.id || !confirm("Delete this resource permanently?")) return;
    const res = await fetch(`/api/admin/resources/${initial.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    router.push("/admin/resources");
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
          Slug (URL)
          <input
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="auto-from-title"
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          />
        </label>
      </div>

      <label className="block text-sm font-semibold">
        Excerpt
        <textarea
          value={form.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
          rows={2}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-semibold">
          Liturgical season *
          <select
            value={form.liturgicalPeriod}
            onChange={(e) => update("liturgicalPeriod", e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          >
            {LITURGICAL_PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Title
          <select
            required
            value={form.grade}
            onChange={(e) => update("grade", e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
            disabled={titleDropdownOptions(titleOptions, form.grade).length === 0}
          >
            {titleDropdownOptions(titleOptions, form.grade).length === 0 ? (
              <option value="">Add a curriculum track first</option>
            ) : (
              titleDropdownOptions(titleOptions, form.grade).map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))
            )}
          </select>
          <span className="mt-1 block text-xs font-normal text-[var(--color-muted)]">
            Matches Curriculum track titles
          </span>
        </label>
        <label className="block text-sm font-semibold">
          Topic
          <input
            value={form.topic}
            onChange={(e) => update("topic", e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          />
        </label>
      </div>

      <div>
        <p className="text-sm font-semibold">Content</p>
        {form.content && !isHtmlContent(form.content, form.contentFormat) && (
          <p className="mt-1 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2">
            Legacy Markdown detected. Saving will store as rich text (HTML).
          </p>
        )}
        <div className="mt-2">
          <RichTextEditor
            value={
              isHtmlContent(form.content, form.contentFormat)
                ? form.content
                : form.content
                  ? `<p>${form.content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br/>")}</p>`
                  : "<p></p>"
            }
            onChange={(html) => update("content", html)}
          />
        </div>
      </div>

      <fieldset className="border border-[var(--color-border)] p-4">
        <legend className="px-2 text-sm font-semibold">Teachers Pay Teachers</legend>
        <p className="text-xs text-[var(--color-muted)]">
          Link to the paid pack on TPT. Use the site for a free preview; full download on TPT.
        </p>
        <label className="mt-3 block text-sm font-semibold">
          TPT product URL
          <input
            type="url"
            value={form.tptUrl}
            onChange={(e) => update("tptUrl", e.target.value)}
            placeholder="https://www.teacherspayteachers.com/Product/..."
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          />
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.isFreeSample}
            onChange={(e) => update("isFreeSample", e.target.checked)}
          />
          On-site content is a free sample (full pack on TPT)
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Preview image URL (Pinterest / social)
          <input
            type="url"
            value={form.previewImageUrl}
            onChange={(e) => update("previewImageUrl", e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          />
        </label>
        <label className="mt-2 text-sm">
          Or upload preview image
          <input
            type="file"
            accept="image/*"
            className="mt-1 block text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadFile(f, "previewImageUrl");
            }}
            disabled={uploading}
          />
        </label>
      </fieldset>

      <fieldset className="border border-[var(--color-border)] p-4">
        <legend className="px-2 text-sm font-semibold">Free sample download (optional)</legend>
        <div className="mt-2 flex flex-wrap items-end gap-4">
          <label className="text-sm">
            Upload PDF / image
            <input
              type="file"
              className="mt-1 block text-sm"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadFile(f, "downloadUrl");
              }}
              disabled={uploading}
            />
          </label>
          {uploading && <span className="text-sm text-[var(--color-muted)]">Uploading…</span>}
        </div>
        <label className="mt-4 block text-sm font-semibold">
          Button label
          <input
            value={form.downloadLabel}
            onChange={(e) => update("downloadLabel", e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          />
        </label>
        <label className="mt-2 block text-sm font-semibold">
          File URL
          <input
            value={form.downloadUrl}
            onChange={(e) => update("downloadUrl", e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          />
        </label>
      </fieldset>

      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => update("published", e.target.checked)}
        />
        Published (visible on site)
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-[var(--color-accent)] px-6 py-2 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create resource"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={() => void onDelete()}
            className="border border-red-300 px-6 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
