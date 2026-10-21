"use client";

import { useState } from "react";

type Props = {
  action: "checkout" | "portal";
  className?: string;
  children: React.ReactNode;
};

/** Starts Stripe Checkout or opens the Customer Portal, then redirects the browser. */
export function BillingButton({ action, className, children }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/billing/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "checkout" ? { interval: "month" } : {}),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      if (res.status === 401) {
        window.location.assign("/account/login");
        return;
      }
      setError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    }
    setBusy(false);
  }

  return (
    <>
      <button type="button" onClick={go} disabled={busy} className={className}>
        {busy ? "Opening secure page..." : children}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-red-700">
          {error}
        </p>
      )}
    </>
  );
}
