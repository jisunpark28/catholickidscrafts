"use client";

import { PLAN_OPTIONS, type PlanInterval } from "@/lib/subscription/plan-copy";
import { useRef, useState } from "react";

type Props = {
  action: "checkout" | "portal";
  /** Checkout billing interval (default month). */
  interval?: PlanInterval;
  className?: string;
  children: React.ReactNode;
};

/** Starts Stripe Checkout or opens the Customer Portal, then redirects the browser. */
export function BillingButton({ action, interval = "month", className, children }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/billing/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "checkout" ? { interval } : {}),
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

/** "Choose your plan" radiogroup (Monthly / Yearly) + checkout button. */
export function PlanCheckout({ className }: { className?: string }) {
  const [selected, setSelected] = useState<PlanInterval>("year");
  const refs = useRef<Record<PlanInterval, HTMLDivElement | null>>({ month: null, year: null });
  const order: PlanInterval[] = ["month", "year"];

  function onKeyDown(e: React.KeyboardEvent) {
    const idx = order.indexOf(selected);
    let next: PlanInterval | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[(idx + 1) % order.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[(idx - 1 + order.length) % order.length];
    else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      return;
    }
    if (next) {
      e.preventDefault();
      setSelected(next);
      refs.current[next]?.focus();
    }
  }

  const opt = PLAN_OPTIONS[selected];

  return (
    <div>
      <p id="plan-choose-label" className="text-sm font-bold text-[var(--color-ink)]">
        Choose your plan
      </p>
      <div
        role="radiogroup"
        aria-labelledby="plan-choose-label"
        onKeyDown={onKeyDown}
        className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {order.map((key) => {
          const o = PLAN_OPTIONS[key];
          const checked = selected === key;
          return (
            <div
              key={key}
              ref={(el) => {
                refs.current[key] = el;
              }}
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => setSelected(key)}
              className={`relative cursor-pointer rounded-xl border-2 bg-white p-4 outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 ${
                checked ? "border-[var(--color-accent)] bg-[#fdf6ef]" : "border-[var(--color-border)] hover:border-[#d9cfc3]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-bold text-[var(--color-ink)]">
                  <span
                    aria-hidden
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      checked ? "border-[var(--color-accent)]" : "border-[#cfc4b8]"
                    }`}
                  >
                    {checked && <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />}
                  </span>
                  {o.name}
                </span>
                {key === "year" && (
                  <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                    Best value
                  </span>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-[var(--color-ink)]">
                {o.price}
                <span className="text-sm font-normal text-[var(--color-muted)]">{o.unit}</span>
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">{o.billed}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <BillingButton action="checkout" interval={selected} className={className}>
          {opt.cta} · {opt.price}
          {opt.unit}
        </BillingButton>
      </div>
      <p className="mt-2 text-center text-xs text-[var(--color-muted)]">Renews automatically. Cancel anytime.</p>
    </div>
  );
}