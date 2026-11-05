"use client";

import { useState } from "react";

/**
 * Shown on the parent sign-in page when this device is in child mode: a grown-up can get a
 * one-time code by email instead of relying on Google asking for a password.
 */
export function DeviceUnlockPanel() {
  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/family/unlock/start", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { sentTo?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send the code. Please try again.");
        return;
      }
      setSentTo(data.sentTo ?? "your email");
      setStep("sent");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/family/unlock/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json().catch(() => ({}))) as { redirect?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "That code did not work.");
        return;
      }
      window.location.href = data.redirect ?? "/account";
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5 rounded-lg border border-[#efe6da] bg-[#fffaf4] px-4 py-4 text-left">
      <p className="m-0 text-sm font-semibold text-[var(--color-ink)]">Grown-up? Leave child mode with an email code</p>
      {step === "idle" ? (
        <>
          <p className="mb-0 mt-1 text-[13px] leading-relaxed text-[var(--color-muted)]">
            We will email a 6-digit code to the family account this device belongs to.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void sendCode()}
            className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-lg border border-[var(--color-border)] bg-white text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)] disabled:opacity-60"
          >
            Email me a code
          </button>
        </>
      ) : (
        <form onSubmit={(e) => void verify(e)} className="mt-2">
          <label htmlFor="unlock-code" className="text-[13px] text-[var(--color-muted)]">
            Code sent to {sentTo}. It expires in 10 minutes.
          </label>
          <input
            id="unlock-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="mt-2 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-center text-lg tracking-[0.4em]"
          />
          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#e07b39] text-sm font-semibold text-white disabled:opacity-60"
          >
            Sign in as the grown-up
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void sendCode()}
            className="mt-2 w-full text-[13px] font-semibold text-[var(--color-link)] disabled:opacity-60"
          >
            Send a new code
          </button>
        </form>
      )}
      {error ? (
        <p role="alert" className="mb-0 mt-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
