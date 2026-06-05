"use client";

import type { SiteCopyAdminRow } from "@/lib/site-copy-admin";
import { SITE_COPY_GROUPS } from "@/lib/site-copy-types";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Props = { initialItems: SiteCopyAdminRow[] };

export function SiteCopyManager({ initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<SiteCopyAdminRow[]>(initialItems);
  const [group, setGroup] = useState<string>(SITE_COPY_GROUPS[0]!.id);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return items.filter((item) => {
      if (item.group !== group) return false;
      if (!q) return true;
      return (
        item.key.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q) ||
        (item.hint?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [items, group, filter]);

  function updateItem(key: string, patch: Partial<SiteCopyAdminRow>) {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  async function saveGroup() {
    const toSave = items.filter((item) => item.group === group);
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/site-copy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: toSave }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      }
      setMessage(`Saved ${data.saved} strings in this section.`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {message && (
        <p className="border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {message}
        </p>
      )}

      <p className="text-sm text-[var(--color-muted)]">
        Edit on-screen text for the public site and embedded games. Content from APIs (Mass
        readings, typing/hangman words, church wall images, Mass Order steps) is managed in their
        own admin screens.
      </p>

      <div className="flex flex-wrap gap-2">
        {SITE_COPY_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGroup(g.id)}
            className={`border px-3 py-1.5 text-xs font-bold ${
              group === g.id
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                : "border-[var(--color-border)] bg-white text-[var(--color-ink)]"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <label className="block text-sm font-semibold">
        Search this section
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mt-1 w-full max-w-md border border-[var(--color-border)] px-3 py-2 text-sm"
          placeholder="Filter by key or text…"
        />
      </label>

      <div className="space-y-4">
        {filtered.map((item) => (
          <article
            key={item.key}
            className="border border-[var(--color-border)] bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <code className="text-xs text-[var(--color-muted)]">{item.key}</code>
              <label className="flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={item.published !== false}
                  onChange={(e) => updateItem(item.key, { published: e.target.checked })}
                />
                Live
              </label>
            </div>
            {item.hint && (
              <p className="mt-1 text-xs text-[var(--color-muted)]">{item.hint}</p>
            )}
            <textarea
              value={item.value}
              onChange={(e) => updateItem(item.key, { value: e.target.value })}
              rows={item.value.length > 120 ? 4 : 2}
              className="mt-2 w-full border border-[var(--color-border)] px-3 py-2 text-sm"
            />
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-[var(--color-muted)]">No strings match your search.</p>
      )}

      <button
        type="button"
        disabled={saving}
        onClick={() => void saveGroup()}
        className="bg-[var(--color-accent)] px-6 py-2 text-sm font-bold text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : `Save “${SITE_COPY_GROUPS.find((g) => g.id === group)?.label ?? group}”`}
      </button>
    </div>
  );
}
