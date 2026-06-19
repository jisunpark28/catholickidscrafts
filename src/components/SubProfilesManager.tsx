"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SubRow = {
  id: string;
  displayName: string;
  accessCodeLast4: string | null;
  active: boolean;
  stickerCount: number;
};

type Props = {
  initialSubs: SubRow[];
  maxSubs: number;
};

export function SubProfilesManager({ initialSubs, maxSubs }: Props) {
  const router = useRouter();
  const [subs, setSubs] = useState(initialSubs);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newAccessId, setNewAccessId] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/account/subs");
    if (res.ok) {
      const data = (await res.json()) as { subs: SubRow[] };
      setSubs(data.subs);
    }
    router.refresh();
  }

  async function addSub() {
    const displayName = window.prompt("Reader name (shown in your dashboard only)");
    if (!displayName?.trim()) return;
    setError("");
    setNewAccessId(null);
    const res = await fetch("/api/account/subs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: displayName.trim() }),
    });
    const data = (await res.json()) as { error?: string; accessId?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not add reader");
      return;
    }
    setNewAccessId(data.accessId ?? null);
    setMessage("Reader added. Copy the Access ID now — it will not be shown again.");
    await refresh();
  }

  async function toggleActive(sub: SubRow) {
    await fetch(`/api/account/subs/${sub.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !sub.active }),
    });
    await refresh();
  }

  async function renameSub(sub: SubRow) {
    const name = window.prompt("New display name", sub.displayName);
    if (!name?.trim()) return;
    await fetch(`/api/account/subs/${sub.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name.trim() }),
    });
    await refresh();
  }

  async function regenerate(sub: SubRow) {
    if (
      !window.confirm(
        `Generate a new Access ID for "${sub.displayName}"? The old ID will stop working.`,
      )
    ) {
      return;
    }
    setNewAccessId(null);
    const res = await fetch(`/api/account/subs/${sub.id}/regenerate`, { method: "POST" });
    const data = (await res.json()) as { error?: string; accessId?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not regenerate");
      return;
    }
    setNewAccessId(data.accessId ?? null);
    setMessage("New Access ID generated. Copy it now — it will not be shown again.");
    await refresh();
  }

  async function deleteSub(sub: SubRow) {
    if (!window.confirm(`Delete "${sub.displayName}" and all sticker progress for this reader?`)) {
      return;
    }
    await fetch(`/api/account/subs/${sub.id}`, { method: "DELETE" });
    await refresh();
  }

  async function activateParentReader() {
    await fetch("/api/auth/reader/as-owner", { method: "POST" });
    setMessage("You are now the active reader for Bible typing on this device.");
    router.refresh();
  }

  return (
    <section className="mt-10 border border-[var(--color-border)] bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[var(--color-ink)]">Reader profiles</h2>
        <button
          type="button"
          onClick={() => void addSub()}
          disabled={subs.length >= maxSubs}
          className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          Add reader
        </button>
      </div>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Up to {maxSubs} readers per family. Each gets an Access ID for{" "}
        <code>/reader/login</code> (no email).
      </p>

      {message && <p className="mt-4 text-sm text-green-800">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {newAccessId && (
        <div className="mt-4 border-2 border-[var(--color-accent)] bg-[var(--color-surface)] p-4">
          <p className="text-sm font-semibold text-[var(--color-ink)]">Access ID (copy now)</p>
          <p className="mt-2 font-mono text-2xl tracking-wide text-[var(--color-ink)]">{newAccessId}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => void activateParentReader()}
        className="mt-6 border border-[var(--color-border)] px-4 py-2 text-sm font-semibold hover:border-[var(--color-accent)]"
      >
        Use my parent account for Bible reading on this device
      </button>

      <ul className="mt-8 divide-y divide-[var(--color-border)]">
        {subs.length === 0 && (
          <li className="py-4 text-sm text-[var(--color-muted)]">No reader profiles yet.</li>
        )}
        {subs.map((sub) => (
          <li key={sub.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-semibold text-[var(--color-ink)]">
                {sub.displayName}
                {!sub.active && (
                  <span className="ml-2 text-xs font-normal text-amber-700">(disabled)</span>
                )}
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                Access ID ends in …{sub.accessCodeLast4 ?? "????"} · {sub.stickerCount} stickers
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void renameSub(sub)}
                className="border border-[var(--color-border)] px-2 py-1 text-xs font-semibold"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => void regenerate(sub)}
                className="border border-[var(--color-border)] px-2 py-1 text-xs font-semibold"
              >
                New Access ID
              </button>
              <button
                type="button"
                onClick={() => void toggleActive(sub)}
                className="border border-[var(--color-border)] px-2 py-1 text-xs font-semibold"
              >
                {sub.active ? "Disable" : "Enable"}
              </button>
              <button
                type="button"
                onClick={() => void deleteSub(sub)}
                className="border border-red-200 px-2 py-1 text-xs font-semibold text-red-700"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
