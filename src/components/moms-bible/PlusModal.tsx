"use client";

import { BEST_VALUE_BADGE, ONE_TIME_LINE, PLUS_ANNUAL_PRICE_LABEL, PLUS_PRICE_LABEL } from "@/lib/subscription/plan-copy";
import Link from "next/link";
import { useEffect, useRef } from "react";
import "@/styles/moms-bible.css";

const PLUS_HREF = "/subscribe";

/** Plus gate (mockup 5): shown when a guest or a parent without Plus tries to write. */
export function PlusModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    boxRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="mb-modal" role="presentation" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={boxRef} className="mb-modal__box" role="dialog" aria-modal="true" aria-labelledby="mb-plus-title">
        <div className="text-[44px] leading-none" aria-hidden>
          💌📖
        </div>
        <h2 id="mb-plus-title" className="mb-modal__title">
          Start a one-of-a-kind Bible for your child
        </h2>
        <p className="mb-sub">Highlight verses, leave Mom&apos;s Notes, and read your child&apos;s replies.</p>
        <div className="mb-modal__plans">
          <div className="mb-plan">
            <div className="mb-plan__price">{PLUS_PRICE_LABEL}</div>
            <div className="mb-sub">30 days</div>
          </div>
          <div className="mb-plan mb-plan--best">
            <span className="mb-plan__badge">{BEST_VALUE_BADGE}</span>
            <div className="mb-plan__price">{PLUS_ANNUAL_PRICE_LABEL}</div>
            <div className="mb-sub">365 days</div>
          </div>
        </div>
        <p className="mb-sub">{ONE_TIME_LINE}</p>
        <Link href={PLUS_HREF} className="mb-btn mb-btn--primary mt-5 px-7 py-3 text-base">
          Get Plus
        </Link>
        <div>
          <button type="button" className="mb-sub mt-3 hover:underline" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
