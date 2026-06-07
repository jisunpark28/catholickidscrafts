"use client";

import type { CurriculumResourceRow } from "@/lib/curriculum-resources";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  trackId: string;
  trackTitle: string;
  initialResources: CurriculumResourceRow[];
};

export function CurriculumResourceOrder({
  trackId,
  trackTitle,
  initialResources,
}: Props) {
  const router = useRouter();
  const [resources, setResources] = useState(initialResources);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= resources.length) return;
    setResources((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item!);
      return copy;
    });
  }

  async function saveOrder() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/curriculum/${trackId}/resources`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceIds: resources.map((r) => r.id) }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      }
      if (Array.isArray(data.resources)) {
        setResources(data.resources as CurriculumResourceRow[]);
      }
      setMessage("Resource order saved. The public curriculum page uses this order.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-10 border border-[var(--color-border)] bg-white p-6">
      <h2 className="text-lg font-bold text-[var(--color-ink)]">Related resources</h2>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Only Kids Resources whose <strong className="text-[var(--color-ink)]">Title</strong> field
        matches this track title (<strong className="text-[var(--color-ink)]">{trackTitle}</strong>)
        appear here and on the public curriculum page. Use the arrows to set display priority (top
        first).
      </p>

      {error && (
        <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {message}
        </p>
      )}

      {resources.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          No resources use this track title yet. Edit a resource in{" "}
          <Link href="/admin/resources" className="font-semibold text-[var(--color-link)]">
            Kids resources
          </Link>{" "}
          and set Title to <strong>{trackTitle}</strong>.
        </p>
      ) : (
        <ol className="mt-4 space-y-2">
          {resources.map((resource, index) => (
            <li
              key={resource.id}
              className="flex flex-wrap items-center justify-between gap-3 border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--color-ink)]">{resource.title}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  /resources/{resource.slug}
                  {!resource.published ? " · Draft" : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="border border-[var(--color-border)] px-2 py-1 text-xs font-bold disabled:opacity-40"
                  aria-label={`Move ${resource.title} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === resources.length - 1}
                  onClick={() => move(index, 1)}
                  className="border border-[var(--color-border)] px-2 py-1 text-xs font-bold disabled:opacity-40"
                  aria-label={`Move ${resource.title} down`}
                >
                  ↓
                </button>
                <Link
                  href={`/admin/resources/${resource.id}/edit`}
                  className="ml-1 text-xs font-semibold text-[var(--color-link)]"
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ol>
      )}

      {resources.length > 0 && (
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveOrder()}
          className="mt-4 bg-[var(--color-accent)] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save resource order"}
        </button>
      )}
    </section>
  );
}
