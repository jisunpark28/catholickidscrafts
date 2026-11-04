"use client";

import { checkPinForChild } from "@/lib/kids/pin-policy";
import { useEffect, useRef, useState } from "react";

type Child = { id: string; displayName: string; kidCode: string };

type Props = {
  child: Child;
  /** "dialog": blocking popup on /account for a child without a PIN. "inline": inside the child row. */
  variant: "dialog" | "inline";
  onSaved: () => void | Promise<void>;
  onCancel: () => void;
  cancelLabel?: string;
};

/** Parent sets or resets a child's 4-digit PIN (checked again on the server). */
export function PinSetupForm({ child, variant, onSaved, onCancel, cancelLabel = "Cancel" }: Props) {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  async function save() {
    setError("");
    const policy = checkPinForChild(pin, child.kidCode);
    if (!policy.ok) {
      setError(policy.message);
      return;
    }
    if (pin !== confirm) {
      setError("The two PINs don't match.");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/account/subs/${encodeURIComponent(child.id)}/pin`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    }).catch(() => null);
    setBusy(false);
    if (!res) {
      setError("Could not save the PIN. Please try again.");
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not save the PIN.");
      return;
    }
    setPin("");
    setConfirm("");
    await onSaved();
  }

  const input =
    "w-24 border border-[var(--color-border)] bg-white px-3 py-2 text-center font-mono text-xl tracking-[0.4em]";
  const digitsOnly = (v: string) => v.replace(/\D/g, "").slice(0, 4);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      className={variant === "inline" ? "mt-3 w-full border border-[var(--color-border)] bg-[var(--color-surface)] p-3" : ""}
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-semibold text-[var(--color-ink)]">
          New PIN
          <input
            ref={firstRef}
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(digitsOnly(e.target.value))}
            className={`mt-1 block ${input}`}
          />
        </label>
        <label className="text-xs font-semibold text-[var(--color-ink)]">
          Type it again
          <input
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={4}
            value={confirm}
            onChange={(e) => setConfirm(digitsOnly(e.target.value))}
            className={`mt-1 block ${input}`}
          />
        </label>
        <button
          type="submit"
          disabled={busy || pin.length !== 4 || confirm.length !== 4}
          className="bg-[var(--color-accent)] px-3 py-2 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save PIN"}
        </button>
        <button type="button" onClick={onCancel} className="px-2 py-2 text-sm text-[var(--color-muted)]">
          {cancelLabel}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        4 digits. Easy PINs like 1234, 1111, 1212 or 1004 aren&apos;t allowed. Saving a PIN also unlocks
        sign-in after too many wrong tries.
      </p>
    </form>
  );
}

/** Blocking popup on /account while an active child has no PIN yet ("Skip for now" hides it for this visit). */
export function PinSetupDialog({
  child,
  onSaved,
  onSkip,
}: {
  child: Child;
  onSaved: () => void | Promise<void>;
  onSkip: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="pin-setup-title">
      <div className="w-full max-w-md border border-[var(--color-border)] bg-white p-6 shadow-xl">
        <h2 id="pin-setup-title" className="text-xl font-bold text-[var(--color-ink)]">
          Set a 4-digit PIN for {child.displayName}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Kids now sign in with a Kid Code and a PIN. {child.displayName}&apos;s Kid Code is{" "}
          <strong className="font-mono text-[var(--color-ink)]">{child.kidCode}</strong>.{" "}
          {child.displayName} can&apos;t sign in until you set a PIN.
        </p>
        <div className="mt-4">
          <PinSetupForm child={child} variant="dialog" onSaved={onSaved} onCancel={onSkip} cancelLabel="Skip for now" />
        </div>
      </div>
    </div>
  );
}
