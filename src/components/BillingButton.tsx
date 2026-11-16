"use client";

import { BEST_VALUE_BADGE, ONE_TIME_LINE, PLAN_OPTIONS, type PlanInterval } from "@/lib/subscription/plan-copy";
import { useRef, useState } from "react";

type Props = {
  action: "checkout" | "portal";
  /** Which one-time pass to buy (default 1 month). */
  interval?: PlanInterval;
  className?: string;
  children: React.ReactNode;
};

/** Starts a one-time Stripe Checkout for a Plus pass or opens the Customer Portal, then redirects the browser. */
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
        body: JSON.stringify(action === "checkout" ? { plan: interval } : {}),
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

/** "Choose your plan" radiogroup (1 month / 1 year one-time passes) + checkout button. */
export function PlanCheckout({ className, extend = false }: { className?: string; extend?: boolean }) {
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
      <p id="plan-choose-label" className="text-center text-base font-bold text-[var(--color-ink)] sm:text-lg">
        Choose your plan
      </p>
      <div
        role="radiogroup"
        aria-labelledby="plan-choose-label"
        onKeyDown={onKeyDown}
        className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
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
              className={`relative cursor-pointer rounded-xl border-2 bg-white px-5 py-6 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 sm:px-6 sm:py-7 ${
                checked ? "border-[var(--color-accent)] bg-[#fdf6ef]" : "border-[var(--color-border)] hover:border-[#d9cfc3]"
              }`}
            >
              {key === "year" && (
                <span className="mb-3 inline-block rounded-full bg-[var(--color-accent)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  {BEST_VALUE_BADGE}
                </span>
              )}
              <span className="flex items-center justify-center gap-2.5 text-base font-bold text-[var(--color-ink)] sm:text-lg">
                <span
                  aria-hidden
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    checked ? "border-[var(--color-accent)]" : "border-[#cfc4b8]"
                  }`}
                >
                  {checked && <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />}
                </span>
                {o.name}
              </span>
              <p className="mt-3 text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
                {o.price}
                <span className="text-base font-normal text-[var(--color-muted)] sm:text-lg">{o.unit}</span>
              </p>
              <p className="mt-1.5 text-sm text-[var(--color-muted)] sm:text-base">{o.billed}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-5">
        <BillingButton action="checkout" interval={selected} className={className}>
          {extend ? opt.cta.replace(/^Get/, "Add") : opt.cta} · {opt.price}
        </BillingButton>
      </div>
      <p className="mt-3 text-center text-sm text-[var(--color-muted)]">
        {ONE_TIME_LINE}
        {extend ? " The new time starts when your current Plus ends." : ""}
      </p>
    </div>
  );
}