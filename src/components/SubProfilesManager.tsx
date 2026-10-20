"use client";

import type { DashboardReaderRow } from "@/lib/account-dashboard";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initialOwner: DashboardReaderRow;
  initialSubs: DashboardReaderRow[];
  maxSubs: number;
};

type DashboardData = {
  owner: DashboardReaderRow;
  subs: DashboardReaderRow[];
};

const CROSS = "\u271D\uFE0E";

function StickerCount({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-ink)]">
      <span
        aria-hidden
        className="text-[var(--color-accent)]"
        style={{ fontFamily: "'Segoe UI Symbol', 'DejaVu Sans', 'Noto Sans Symbols', serif" }}
      >
        {CROSS}
      </span>
      {count}
      <span className="sr-only"> stickers</span>
    </span>
  );
}

function initial(name: string) {
  return (name.trim()[0] ?? "?").toUpperCase();
}

export function SubProfilesManager({ initialOwner, initialSubs, maxSubs }: Props) {
  const router = useRouter();
  const [owner, setOwner] = useState(initialOwner);
  const [subs, setSubs] = useState(initialSubs);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newAccessId, setNewAccessId] = useState<string | null>(null);
  const [addingChild, setAddingChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const atLimit = subs.length >= maxSubs;

  async function refresh() {
    const res = await fetch("/api/account/subs");
    if (res.ok) {
      const data = (await res.json()) as DashboardData;
      setOwner(data.owner);
      setSubs(data.subs);
    }
    router.refresh();
  }

  async function submitNewChild() {
    const displayName = newChildName.trim();
    if (!displayName) return;
    setError("");
    setMessage("");
    setNewAccessId(null);
    const res = await fetch("/api/account/subs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });
    const data = (await res.json()) as { error?: string; accessId?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not add child");
      return;
    }
    setNewAccessId(data.accessId ?? null);
    setMessage("Child added. Copy the Access ID now. Your child signs in with it at /reader/login.");
    setAddingChild(false);
    setNewChildName("");
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
        `Make a new Access ID for "${row.displayName}"? The old code will stop working.`,
      )
    ) {
      return;
    }
    setError("");
    setNewAccessId(null);
    const res = await fetch(`/api/account/subs/${row.id}/regenerate`, { method: "POST" });
    const data = (await res.json()) as { error?: string; accessId?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not make a new code");
      return;
    }
    setNewAccessId(data.accessId ?? null);
    setMessage("New Access ID made. Copy it now. It will not be shown again.");
    await refresh();
  }

  async function deleteSub(row: DashboardReaderRow) {
    if (row.kind !== "sub" || !row.id) return;
    if (!window.confirm(`Delete "${row.displayName}" and all of this child's progress?`)) {
      return;
    }
    await fetch(`/api/account/subs/${row.id}`, { method: "DELETE" });
    await refresh();
  }

  const btn =
    "border border-[var(--color-border)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]";

  return (
    <section className="border border-[var(--color-border)] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold text-[var(--color-ink)]">Who&apos;s reading?</h2>
        <p className="text-sm text-[var(--color-muted)]">
          {subs.length} of {maxSubs} children
        </p>
      </div>

      {message && <p className="mt-4 text-sm text-green-800">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {newAccessId && (
        <div className="mt-4 border-2 border-[var(--color-accent)] bg-[var(--color-surface)] p-4">
          <p className="text-sm font-semibold text-[var(--color-ink)]">Access ID (copy now)</p>
          <p className="mt-2 break-all font-mono text-2xl tracking-wide text-[var(--color-ink)]">
            {newAccessId}
          </p>
        </div>
      )}

      <ul className="mt-5 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
        <li className="flex flex-wrap items-center gap-3 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] font-bold text-[var(--color-ink)]">
            {initial(owner.displayName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[var(--color-ink)]">
              {owner.displayName}{" "}
              <span className="ml-1 text-xs font-normal text-[var(--color-muted)]">Parent</span>
            </p>
            <p className="break-all text-xs text-[var(--color-muted)]">{owner.accountLabel}</p>
          </div>
          <StickerCount count={owner.totalStickers} />
        </li>

        {subs.map((row) => {
          const isEditing = row.id === editingId;
          return (
            <li key={row.id!} className="flex flex-wrap items-center gap-3 py-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${
                  row.active
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-muted)]"
                }`}
              >
                {initial(row.displayName)}
              </span>
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void saveRename(row);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="min-w-[8rem] border border-[var(--color-border)] px-2 py-1"
                      autoFocus
                    />
                    <button type="button" onClick={() => void saveRename(row)} className="text-xs font-semibold text-[var(--color-link)]">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="text-xs text-[var(--color-muted)]">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    title="Rename"
                    onClick={() => {
                      setEditingId(row.id);
                      setEditingName(row.displayName);
                    }}
                    className="text-left font-semibold text-[var(--color-ink)] hover:underline"
                  >
                    {row.displayName}
                    {!row.active && (
                      <span className="ml-2 text-xs font-normal text-amber-700">(paused)</span>
                    )}
                  </button>
                )}
                <p className="font-mono text-xs text-[var(--color-muted)]">{row.accountLabel}</p>
              </div>
              <StickerCount count={row.totalStickers} />
              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <button type="button" className={btn} onClick={() => void regenerate(row)}>
                  Make new code
                </button>
                <button type="button" className={btn} onClick={() => void toggleActive(row)}>
                  {row.active ? "Pause" : "Resume"}
                </button>
                <button
                  type="button"
                  className={`${btn} text-red-700`}
                  onClick={() => void deleteSub(row)}
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {addingChild ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newChildName}
            onChange={(e) => setNewChildName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submitNewChild();
              if (e.key === "Escape") {
                setAddingChild(false);
                setNewChildName("");
              }
            }}
            placeholder="Child's name"
            className="min-w-[12rem] flex-1 border border-[var(--color-border)] px-3 py-2"
            autoFocus
          />
          <button
            type="button"
            onClick={() => void submitNewChild()}
            disabled={!newChildName.trim()}
            className="bg-[var(--color-accent)] px-3 py-2 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setAddingChild(false);
              setNewChildName("");
            }}
            className="px-3 py-2 text-sm text-[var(--color-muted)]"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setAddingChild(true);
            setError("");
          }}
          disabled={atLimit}
          className="mt-4 w-full border-2 border-dashed border-[var(--color-border)] px-4 py-3 text-sm font-bold text-[var(--color-ink)] hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add child
        </button>
      )}
      {atLimit && (
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          A family account can have up to {maxSubs} children. Delete a profile to add a new one.
        </p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-[var(--color-muted)]">
        Access IDs are shown only once, when you make them. If a code is lost, make a new one.
        Children can&apos;t post in public discussions.
      </p>
    </section>
  );
}
