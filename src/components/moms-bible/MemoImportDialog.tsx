"use client";

import { useState } from "react";
import { mbFetch } from "./mb-fetch";
import "@/styles/moms-bible.css";

type Child = { id: string; displayName: string };

async function moveMemos(childId: string) {
  return mbFetch<{ imported: number }>("/api/moms-bible/import-memos", "POST", { childId });
}

/**
 * After the first child is added (design section 9): "Move your N existing Bible notes to Mia's
 * Bible?" Not now hides the popup; the offer stays in /account until the notes are moved.
 */
export function MemoImportDialog({
  child,
  count,
  onClose,
}: {
  child: Child;
  count: number;
  onClose: (result: { imported: number } | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function move() {
    setBusy(true);
    setError(null);
    const res = await moveMemos(child.id);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    onClose({ imported: res.data.imported });
  }

  async function later() {
    setBusy(true);
    await mbFetch("/api/moms-bible/import-memos", "POST", { dismiss: true });
    setBusy(false);
    onClose(null);
  }

  return (
    <div className="mb-modal" role="presentation">
      <div className="mb-modal__box" role="dialog" aria-modal="true" aria-labelledby="mb-import-title">
        <div className="text-[40px] leading-none" aria-hidden>
          📝💌
        </div>
        <h2 id="mb-import-title" className="mb-modal__title">
          Move your {count} existing Bible {count === 1 ? "note" : "notes"} to {child.displayName}&apos;s Bible?
        </h2>
        <p className="mb-sub">
          They become Mom&apos;s Notes on the same verses, so {child.displayName} can read them and reply. Your originals
          stay in My Memos.
        </p>
        {error && (
          <p className="mb-error mt-3" role="alert">
            {error}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" className="mb-btn mb-btn--primary" disabled={busy} onClick={() => void move()}>
            {busy ? "Moving…" : "Move them"}
          </button>
          <button type="button" className="mb-btn mb-btn--ghost" disabled={busy} onClick={() => void later()}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

/** /account: the same offer, kept until the notes are moved. */
export function MemoImportOffer({ count, kids: children }: { count: number; kids: Child[] }) {
  const [childId, setChildId] = useState(children[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (children.length === 0) return null;
  if (done !== null) {
    const name = children.find((c) => c.id === childId)?.displayName ?? "";
    return <p className="mt-4 text-sm text-green-800">Moved {done} {done === 1 ? "note" : "notes"} to {name}&apos;s Bible 💌</p>;
  }
  return (
    <div className="mt-4 rounded-2xl border border-[#f2d36b] bg-[#fff8d2] p-4 text-sm">
      <p className="font-semibold">
        📝 You have {count} Bible {count === 1 ? "note" : "notes"} from before.
      </p>
      <p className="mt-1 text-[#6b7280]">Move them into your child&apos;s Bible as Mom&apos;s Notes. Your originals stay in My Memos.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {children.length > 1 && (
          <label className="mb-field">
            <span className="sr-only">Child</span>
            <select value={childId} onChange={(e) => setChildId(e.target.value)}>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName}&apos;s Bible
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          type="button"
          className="mb-btn mb-btn--primary"
          disabled={busy || !childId}
          onClick={() => {
            void (async () => {
              setBusy(true);
              setError(null);
              const res = await moveMemos(childId);
              setBusy(false);
              if (res.ok) setDone(res.data.imported);
              else setError(res.error);
            })();
          }}
        >
          {busy ? "Moving…" : children.length > 1 ? "Move them" : `Move them to ${children[0]!.displayName}'s Bible`}
        </button>
      </div>
      {error && (
        <p className="mb-error mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
