"use client";

import type { DashboardReaderRow, StickerCategoryKey } from "@/lib/account-dashboard";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Props = {
  initialOwner: DashboardReaderRow;
  initialSubs: DashboardReaderRow[];
  maxSubs: number;
};

type DashboardData = {
  owner: DashboardReaderRow;
  subs: DashboardReaderRow[];
};

const DEFAULT_CATEGORY: StickerCategoryKey = "bible";

function categoryProgress(row: DashboardReaderRow, key: StickerCategoryKey) {
  const cat = row.categories.find((c) => c.key === key) ?? row.categories[0];
  return cat ? `${cat.completed}/${cat.total}` : "—";
}

export function SubProfilesManager({ initialOwner, initialSubs, maxSubs }: Props) {
  const router = useRouter();
  const [owner, setOwner] = useState(initialOwner);
  const [subs, setSubs] = useState(initialSubs);
  const [categoryByRow, setCategoryByRow] = useState<Record<string, StickerCategoryKey>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newAccessId, setNewAccessId] = useState<string | null>(null);
  const [addingReader, setAddingReader] = useState(false);
  const [newReaderName, setNewReaderName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const rows = useMemo(() => [owner, ...subs], [owner, subs]);

  function rowKey(row: DashboardReaderRow) {
    return row.kind === "owner" ? "owner" : row.id!;
  }

  function getCategoryKey(row: DashboardReaderRow): StickerCategoryKey {
    return categoryByRow[rowKey(row)] ?? DEFAULT_CATEGORY;
  }

  async function refresh() {
    const res = await fetch("/api/account/subs");
    if (res.ok) {
      const data = (await res.json()) as DashboardData;
      setOwner(data.owner);
      setSubs(data.subs);
    }
    router.refresh();
  }

  async function submitNewReader() {
    const displayName = newReaderName.trim();
    if (!displayName) return;
    setError("");
    setNewAccessId(null);
    const res = await fetch("/api/account/subs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });
    const data = (await res.json()) as { error?: string; accessId?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not add reader");
      return;
    }
    setNewAccessId(data.accessId ?? null);
    setMessage("Reader added. Copy the Access ID now — it will not be shown again.");
    setAddingReader(false);
    setNewReaderName("");
    await refresh();
  }

  async function saveRename(row: DashboardReaderRow) {
    const name = editingName.trim();
    if (!name || row.kind !== "sub" || !row.id) return;
    await fetch(`/api/account/subs/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name }),
    });
    setEditingId(null);
    setEditingName("");
    await refresh();
  }

  async function toggleActive(row: DashboardReaderRow) {
    if (row.kind !== "sub" || !row.id) return;
    await fetch(`/api/account/subs/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !row.active }),
    });
    await refresh();
  }

  async function regenerate(row: DashboardReaderRow) {
    if (row.kind !== "sub" || !row.id) return;
    if (
      !window.confirm(
        `Generate a new Access ID for "${row.displayName}"? The old ID will stop working.`,
      )
    ) {
      return;
    }
    setNewAccessId(null);
    const res = await fetch(`/api/account/subs/${row.id}/regenerate`, { method: "POST" });
    const data = (await res.json()) as { error?: string; accessId?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not regenerate");
      return;
    }
    setNewAccessId(data.accessId ?? null);
    setMessage("New Access ID generated. Copy it now — it will not be shown again.");
    await refresh();
  }

  async function deleteSub(row: DashboardReaderRow) {
    if (row.kind !== "sub" || !row.id) return;
    if (!window.confirm(`Delete "${row.displayName}" and all sticker progress for this reader?`)) {
      return;
    }
    await fetch(`/api/account/subs/${row.id}`, { method: "DELETE" });
    await refresh();
  }

  function handleAction(row: DashboardReaderRow, action: string) {
    if (action === "") return;
    if (action === "rename") {
      if (row.kind !== "sub" || !row.id) return;
      setEditingId(row.id);
      setEditingName(row.displayName);
      return;
    }
    if (action === "new-access-id") {
      void regenerate(row);
      return;
    }
    if (action === "disable") {
      void toggleActive(row);
      return;
    }
    if (action === "delete") {
      void deleteSub(row);
    }
  }

  return (
    <section className="mt-10 border border-[var(--color-border)] bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[var(--color-ink)]">Reader profiles</h2>
        <button
          type="button"
          onClick={() => {
            setAddingReader(true);
            setError("");
          }}
          disabled={subs.length >= maxSubs || addingReader}
          className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          Add Reader
        </button>
      </div>

      {message && <p className="mt-4 text-sm text-green-800">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {newAccessId && (
        <div className="mt-4 border-2 border-[var(--color-accent)] bg-[var(--color-surface)] p-4">
          <p className="text-sm font-semibold text-[var(--color-ink)]">Access ID (copy now)</p>
          <p className="mt-2 font-mono text-2xl tracking-wide text-[var(--color-ink)]">{newAccessId}</p>
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              <th className="py-3 pr-3 font-semibold">Name</th>
              <th className="py-3 pr-3 font-semibold">Account</th>
              <th className="py-3 pr-3 font-semibold">Total stickers</th>
              <th className="py-3 pr-3 font-semibold">Item</th>
              <th className="py-3 pr-3 font-semibold">Progress</th>
              <th className="py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const key = rowKey(row);
              const categoryKey = getCategoryKey(row);
              const isEditing = row.kind === "sub" && row.id === editingId;

              return (
                <tr key={key} className="border-b border-[var(--color-border)]">
                  <td className="py-3 pr-3 align-middle">
                    {isEditing ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="min-w-[8rem] border border-[var(--color-border)] px-2 py-1"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => void saveRename(row)}
                          className="text-xs font-semibold text-[var(--color-link)]"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditingName("");
                          }}
                          className="text-xs text-[var(--color-muted)]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="font-semibold text-[var(--color-ink)]">
                        {row.displayName}
                        {row.kind === "sub" && !row.active && (
                          <span className="ml-2 text-xs font-normal text-amber-700">(disabled)</span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-3 align-middle text-[var(--color-muted)]">
                    {row.accountLabel}
                  </td>
                  <td className="py-3 pr-3 align-middle font-semibold text-[var(--color-ink)]">
                    {row.totalStickers}
                  </td>
                  <td className="py-3 pr-3 align-middle">
                    <select
                      value={categoryKey}
                      onChange={(e) =>
                        setCategoryByRow((prev) => ({
                          ...prev,
                          [key]: e.target.value as StickerCategoryKey,
                        }))
                      }
                      className="border border-[var(--color-border)] bg-white px-2 py-1 text-sm"
                    >
                      {row.categories.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 pr-3 align-middle font-mono text-[var(--color-ink)]">
                    {categoryProgress(row, categoryKey)}
                  </td>
                  <td className="py-3 align-middle">
                    {row.kind === "sub" ? (
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          handleAction(row, e.target.value);
                          e.target.value = "";
                        }}
                        className="border border-[var(--color-border)] bg-white px-2 py-1 text-sm"
                      >
                        <option value="" disabled>
                          Choose…
                        </option>
                        <option value="rename">Rename</option>
                        <option value="new-access-id">New Access ID</option>
                        <option value="disable">{row.active ? "Disable" : "Enable"}</option>
                        <option value="delete">Delete</option>
                      </select>
                    ) : (
                      <span className="text-xs text-[var(--color-muted)]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {addingReader && (
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <td className="py-3 pr-3 align-middle" colSpan={6}>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={newReaderName}
                      onChange={(e) => setNewReaderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void submitNewReader();
                        if (e.key === "Escape") {
                          setAddingReader(false);
                          setNewReaderName("");
                        }
                      }}
                      placeholder="Reader name"
                      className="min-w-[12rem] border border-[var(--color-border)] px-3 py-2"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => void submitNewReader()}
                      disabled={!newReaderName.trim()}
                      className="bg-[var(--color-accent)] px-3 py-2 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingReader(false);
                        setNewReaderName("");
                      }}
                      className="px-3 py-2 text-sm text-[var(--color-muted)]"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
