"use client";

import type { AdminSiteCopyRow } from "@/lib/site-copy-admin-data";
import { useMemo, useState } from "react";

type Props = {
  initialRows: AdminSiteCopyRow[];
  groupLabels: Record<string, string>;
};

type StatusFilter = "all" | "overridden" | "default" | "unpublished";

const PAGE_SIZE = 50;
const VALUE_MAX = 10_000;

/** Value shown in the editor: the saved override if any, else the built-in default. */
function editorValue(row: AdminSiteCopyRow): string {
  return row.dbValue ?? row.defaultValue ?? "";
}

export function SiteCopyManager({ initialRows, groupLabels }: Props) {
  const [rows, setRows] = useState<AdminSiteCopyRow[]>(initialRows);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const groups = useMemo(() => [...new Set(rows.map((r) => r.group))].sort(), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (group && r.group !== group) return false;
      if (status === "overridden" && r.dbValue === null) return false;
      if (status === "default" && r.dbValue !== null) return false;
      if (status === "unpublished" && r.published !== false) return false;
      if (!q) return true;
      return (
        r.key.toLowerCase().includes(q) ||
        (r.hint ?? "").toLowerCase().includes(q) ||
        (r.defaultValue ?? "").toLowerCase().includes(q) ||
        (r.dbValue ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, group, status]);

  const visible = filtered.slice(0, limit);

  function updateRow(key: string, patch: Partial<AdminSiteCopyRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function clearDraft(key: string) {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function save(row: AdminSiteCopyRow, published?: boolean) {
    // Toggling Live keeps the saved text; only the Save button sends the draft.
    const togglingLive = published !== undefined && row.dbValue !== null;
    const value = togglingLive ? row.dbValue! : (drafts[row.key] ?? editorValue(row));
    setBusyKey(row.key);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/site-copy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: row.key, value, ...(published === undefined ? {} : { published }) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      updateRow(row.key, {
        dbValue: data.dbValue,
        published: data.published,
        updatedAt: data.updatedAt,
      });
      if (!togglingLive) clearDraft(row.key);
      setMessage(`Saved ${row.key}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusyKey("");
    }
  }

  async function reset(row: AdminSiteCopyRow) {
    if (!window.confirm(`Reset "${row.key}" to the built-in default?`)) return;
    setBusyKey(row.key);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/site-copy?key=${encodeURIComponent(row.key)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Reset failed");
      updateRow(row.key, { dbValue: null, published: null, updatedAt: null });
      clearDraft(row.key);
      setMessage(`Reset ${row.key} to default.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setBusyKey("");
    }
  }

  const overriddenCount = rows.filter((r) => r.dbValue !== null).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 border border-[var(--color-border)] bg-white p-4">
        <label className="block text-xs font-semibold">
          Search key or text
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE_SIZE);
            }}
            placeholder="e.g. home.features.prayers"
            className="mt-1 w-72 border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs font-semibold">
          Group
          <select
            value={group}
            onChange={(e) => {
              setGroup(e.target.value);
              setLimit(PAGE_SIZE);
            }}
            className="mt-1 block border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm"
          >
            <option value="">All groups</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {groupLabels[g] ? `${groupLabels[g]} (${g})` : g}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold">
          Status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFilter);
              setLimit(PAGE_SIZE);
            }}
            className="mt-1 block border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="overridden">Edited (saved in DB)</option>
            <option value="default">Using default</option>
            <option value="unpublished">Hidden overrides</option>
          </select>
        </label>
        <p className="text-xs text-[var(--color-muted)]">
          {filtered.length} of {rows.length} keys - {overriddenCount} edited
        </p>
      </div>

      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {message && (
        <p className="border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {message}
        </p>
      )}

      <div className="space-y-3">
        {visible.map((row) => {
          const draft = drafts[row.key];
          const current = editorValue(row);
          const value = draft ?? current;
          const dirty = draft !== undefined && draft !== current;
          const busy = busyKey === row.key;
          const differsFromDefault =
            row.dbValue !== null && row.defaultValue !== null && row.dbValue !== row.defaultValue;

          return (
            <article
              key={row.key}
              className="border border-[var(--color-border)] bg-white p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-semibold text-[var(--color-ink)]">{row.key}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {groupLabels[row.group] ?? row.group}
                    {row.format !== "plain" ? ` - ${row.format}` : ""}
                    {row.hint ? ` - ${row.hint}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  {row.dbValue === null ? (
                    <span className="border border-[var(--color-border)] px-2 py-0.5 text-[var(--color-muted)]">
                      Default
                    </span>
                  ) : (
                    <span className="border border-amber-300 bg-amber-50 px-2 py-0.5 text-amber-800">
                      Edited{row.published === false ? " (hidden)" : ""}
                    </span>
                  )}
                  {row.dbValue !== null && (
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={row.published !== false}
                        disabled={busy}
                        onChange={(e) => void save(row, e.target.checked)}
                      />
                      Live
                    </label>
                  )}
                </div>
              </div>

              <textarea
                value={value}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [row.key]: e.target.value }))}
                rows={Math.min(8, Math.max(2, Math.ceil(value.length / 90)))}
                maxLength={VALUE_MAX}
                className="mt-2 w-full border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm"
              />

              {row.defaultValue !== null && (row.dbValue !== null || dirty) && (
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  <span className="font-semibold">Default:</span> {row.defaultValue}
                  {differsFromDefault ? "" : row.dbValue !== null ? " (same as saved)" : ""}
                </p>
              )}
              {row.defaultValue === null && (
                <p className="mt-1 text-xs text-[var(--color-muted)]">No built-in default (DB only).</p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busy || !dirty}
                  onClick={() => void save(row)}
                  className="bg-[var(--color-accent)] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                >
                  {busy ? "Saving..." : "Save"}
                </button>
                {dirty && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => clearDraft(row.key)}
                    className="border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold"
                  >
                    Undo changes
                  </button>
                )}
                {row.dbValue !== null && row.defaultValue !== null && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void reset(row)}
                    className="border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  >
                    Reset to default
                  </button>
                )}
                {row.updatedAt && (
                  <span className="text-xs text-[var(--color-muted)]">
                    Updated {new Date(row.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length > visible.length && (
        <button
          type="button"
          onClick={() => setLimit((n) => n + PAGE_SIZE)}
          className="border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold"
        >
          Show more ({filtered.length - visible.length} left)
        </button>
      )}
      {filtered.length === 0 && (
        <p className="text-sm text-[var(--color-muted)]">No keys match these filters.</p>
      )}
    </div>
  );
}
