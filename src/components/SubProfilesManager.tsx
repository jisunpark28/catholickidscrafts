"use client";

import { PinSetupDialog, PinSetupForm } from "@/components/kid/PinSetupDialog";
import { MemoImportDialog } from "@/components/moms-bible/MemoImportDialog";
import type { DashboardReaderRow } from "@/lib/account-dashboard";
import { clearKidProfiles } from "@/lib/kids/kid-device-profiles";
import type { KidPinStatus } from "@/lib/kids/kid-pin";
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

const PIN_STATUS_LABEL: Record<KidPinStatus, { text: string; className: string }> = {
  not_set: { text: "No PIN yet: can't sign in", className: "bg-amber-50 text-amber-800 border-amber-200" },
  set: { text: "PIN set", className: "bg-green-50 text-green-800 border-green-200" },
  locked: { text: "Paused: too many wrong PINs", className: "bg-amber-50 text-amber-800 border-amber-200" },
  disabled: { text: "Locked: set a new PIN", className: "bg-red-50 text-red-700 border-red-200" },
};

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

function PinBadge({ status }: { status: KidPinStatus | null }) {
  if (!status) return null;
  const s = PIN_STATUS_LABEL[status];
  return <span className={`ml-2 inline-block border px-1.5 py-0.5 text-[11px] font-semibold ${s.className}`}>{s.text}</span>;
}

export function SubProfilesManager({ initialOwner, initialSubs, maxSubs }: Props) {
  const router = useRouter();
  const [owner, setOwner] = useState(initialOwner);
  const [subs, setSubs] = useState(initialSubs);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [addingChild, setAddingChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pinFormId, setPinFormId] = useState<string | null>(null);
  /** Children whose "Set a PIN" popup was skipped during this visit. */
  const [skippedPinIds, setSkippedPinIds] = useState<string[]>([]);
  /** First child added: offer to move the parent's old Bible memos (after the PIN step). */
  const [memoImport, setMemoImport] = useState<{ child: { id: string; displayName: string }; count: number } | null>(null);

  const atLimit = subs.length >= maxSubs;
  const needsPin = subs.find(
    (s) => s.active && s.id && s.kidCode && s.pinStatus === "not_set" && !skippedPinIds.includes(s.id),
  );

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
    const res = await fetch("/api/account/subs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      sub?: { id: string; displayName: string; kidCode: string };
      memoImport?: { count: number };
    };
    if (!res.ok || !data.sub) {
      setError(data.error ?? "Could not add child");
      return;
    }
    setMessage(
      `${data.sub.displayName} was added. Kid Code: ${data.sub.kidCode}. Set a 4-digit PIN below so ${data.sub.displayName} can sign in at /kids.`,
    );
    setAddingChild(false);
    setNewChildName("");
    await refresh();
    setPinFormId(data.sub.id);
    if (data.memoImport && data.memoImport.count > 0) {
      setMemoImport({ child: { id: data.sub.id, displayName: data.sub.displayName }, count: data.memoImport.count });
    }
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

  async function newKidCode(row: DashboardReaderRow) {
    if (row.kind !== "sub" || !row.id) return;
    if (
      !window.confirm(
        `Make a new Kid Code for "${row.displayName}"? The old code (${row.kidCode}) stops working, so ${row.displayName} has to add the new code on each device. The PIN stays the same.`,
      )
    ) {
      return;
    }
    setError("");
    setMessage("");
    const res = await fetch(`/api/account/subs/${row.id}/regenerate`, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { error?: string; kidCode?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not make a new code");
      return;
    }
    setMessage(`New Kid Code for ${row.displayName}: ${data.kidCode ?? ""}`);
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

  async function pinSaved(row: { id: string | null; displayName: string }) {
    setPinFormId(null);
    setError("");
    setMessage(`PIN saved. ${row.displayName} can now sign in at /kids with the Kid Code and PIN.`);
    await refresh();
  }

  function forgetDeviceProfiles() {
    if (!window.confirm("Remove all kid profiles from the sign-in screen on this device?")) return;
    clearKidProfiles();
    setMessage("Kid profiles were removed from this device's sign-in screen.");
  }

  const btn =
    "border border-[var(--color-border)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]";

  return (
    <section className="border border-[var(--color-border)] bg-white p-5 sm:p-6">
      {needsPin && needsPin.id && needsPin.kidCode && pinFormId === null && (
        <PinSetupDialog
          child={{ id: needsPin.id, displayName: needsPin.displayName, kidCode: needsPin.kidCode }}
          onSaved={() => pinSaved(needsPin)}
          onSkip={() => setSkippedPinIds((ids) => [...ids, needsPin.id!])}
        />
      )}
      {memoImport && pinFormId === null && !(needsPin && needsPin.id && needsPin.kidCode) && (
        <MemoImportDialog
          child={memoImport.child}
          count={memoImport.count}
          onClose={(result) => {
            if (result) setMessage(`Moved ${result.imported} ${result.imported === 1 ? "note" : "notes"} to ${memoImport.child.displayName}'s Bible 💌`);
            setMemoImport(null);
            router.refresh();
          }}
        />
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold text-[var(--color-ink)]">Who&apos;s reading?</h2>
        <p className="text-sm text-[var(--color-muted)]">
          {subs.length} of {maxSubs} children
        </p>
      </div>

      {message && <p className="mt-4 text-sm text-green-800">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

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
          const showPinForm = row.id !== null && row.id === pinFormId;
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
                <p className="text-xs text-[var(--color-muted)]">
                  Kid Code{" "}
                  <span className="font-mono font-semibold text-[var(--color-ink)]">{row.kidCode}</span>
                  <PinBadge status={row.pinStatus} />
                </p>
              </div>
              <StickerCount count={row.totalStickers} />
              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <button
                  type="button"
                  className={`${btn} ${row.pinStatus === "not_set" || row.pinStatus === "disabled" ? "border-[var(--color-accent)]" : ""}`}
                  onClick={() => setPinFormId(showPinForm ? null : row.id)}
                >
                  {row.pinStatus === "not_set" ? "Set PIN" : "Reset PIN"}
                </button>
                <button type="button" className={btn} onClick={() => void newKidCode(row)}>
                  New Kid Code
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
              {showPinForm && row.id && row.kidCode && (
                <PinSetupForm
                  child={{ id: row.id, displayName: row.displayName, kidCode: row.kidCode }}
                  variant="inline"
                  onSaved={() => pinSaved(row)}
                  onCancel={() => setPinFormId(null)}
                />
              )}
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
            placeholder="Child's first name"
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
        Children sign in at <strong>/kids</strong> with their Kid Code and a 4-digit PIN that you set
        here. Kid Codes aren&apos;t secret; keep the PIN private. After 20 wrong PINs, sign-in turns off
        until you set a new PIN. Children can&apos;t post in public discussions.
      </p>
      <button
        type="button"
        onClick={forgetDeviceProfiles}
        className="mt-2 text-xs font-semibold text-[var(--color-link)] hover:underline"
      >
        Forget kid profiles on this device
      </button>
    </section>
  );
}
