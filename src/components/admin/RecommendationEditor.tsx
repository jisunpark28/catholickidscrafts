"use client";

import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { isAmazonUrl } from "@/lib/external-links";
import { EXTERNAL_LINK_TYPES, RECOMMENDATION_KINDS } from "@/lib/recommendation-types";
import type { ExternalLinkType, RecommendationKind } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type RecommendationFormData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  kind: RecommendationKind;
  linkType: ExternalLinkType;
  externalUrl: string;
  author: string;
  imageUrl: string;
  tags: string;
  sortOrder: number;
  published: boolean;
};

const kindOptions = RECOMMENDATION_KINDS.filter((k) => k.id !== "ALL") as {
  id: RecommendationKind;
  label: string;
}[];

type Props = { initial?: RecommendationFormData };

export function RecommendationEditor({ initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<RecommendationFormData>(
    initial ?? {
      title: "",
      slug: "",
      excerpt: "",
      description: "",
      kind: "VIDEO",
      linkType: "STANDARD",
      externalUrl: "",
      author: "",
      imageUrl: "",
      tags: "",
      sortOrder: 0,
      published: true,
    },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const amazonDetected =
    form.externalUrl.trim() !== "" && isAmazonUrl(form.externalUrl);

  function update<K extends keyof RecommendationFormData>(
    key: K,
    value: RecommendationFormData[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isEdit
        ? `/api/admin/recommendations/${initial!.id}`
        : "/api/admin/recommendations";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          author: form.author || null,
          imageUrl: form.imageUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      router.push("/admin/recommendations");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!initial?.id || !confirm("Delete this recommendation?")) return;
    const res = await fetch(`/api/admin/recommendations/${initial.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    router.push("/admin/recommendations");
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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Type *
          <select
            value={form.kind}
            onChange={(e) => update("kind", e.target.value as RecommendationKind)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          >
            {kindOptions.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
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

      <label className="block text-sm font-semibold">
        Link URL * (YouTube, Amazon, PDF, etc.)
        <input
          required
          type="url"
          value={form.externalUrl}
          onChange={(e) => update("externalUrl", e.target.value)}
          placeholder="https://"
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        />
      </label>

      <fieldset className="border border-[var(--color-border)] p-4">
        <legend className="px-2 text-sm font-semibold">Link policy</legend>
        <p className="text-xs text-[var(--color-muted)]">
          Amazon Associate links show an automatic disclosure on the site.{" "}
          <Link href="/affiliate-disclosure" className="text-[var(--color-link)]" target="_blank">
            Public disclosure page
          </Link>
          .
        </p>
        <div className="mt-3 space-y-2">
          {EXTERNAL_LINK_TYPES.map((opt) => (
            <label key={opt.id} className="flex cursor-pointer gap-2 text-sm">
              <input
                type="radio"
                name="linkType"
                checked={form.linkType === opt.id}
                onChange={() => update("linkType", opt.id)}
              />
              <span>
                <span className="font-semibold">{opt.label}</span>
                <span className="block text-xs text-[var(--color-muted)]">{opt.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {amazonDetected && form.linkType === "STANDARD" && (
          <p className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            This URL looks like Amazon. Consider choosing &quot;Amazon Associate&quot; so the
            correct disclosure and <code>rel=&quot;sponsored&quot;</code> are applied.
          </p>
        )}
      </fieldset>

      <label className="block text-sm font-semibold">
        Short excerpt
        <textarea
          value={form.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
          rows={2}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Author / Channel
          <input
            value={form.author}
            onChange={(e) => update("author", e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          />
        </label>
        <label className="block text-sm font-semibold">
          Cover image URL (optional)
          <input
            value={form.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
          />
        </label>
      </div>

      <label className="block text-sm font-semibold">
        Tags (comma-separated, for search)
        <input
          value={form.tags}
          onChange={(e) => update("tags", e.target.value)}
          placeholder="advent, music, kindergarten"
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2"
        />
      </label>

      <div>
        <p className="text-sm font-semibold">Longer notes (optional)</p>
        <div className="mt-2">
          <RichTextEditor
            value={form.description || "<p></p>"}
            onChange={(html) => update("description", html)}
            placeholder="Why you recommend this…"
          />
        </div>
      </div>

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
