"use client";

import { fredoka } from "@/components/liturgy/fredoka";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import "@/styles/learn-gate.css";

type Props = {
  title: string;
  message: string;
  imageSrc: string;
  imageAlt: string;
  /** Story cards are portrait; prayer drawings fill the square frame. */
  imageFit?: "cover" | "contain";
  signInHref: string;
  onClose: () => void;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Warm sign-in preview. Closes on the backdrop, Close, and Escape, and keeps focus inside. */
export function LearnGateDialog({ title, message, imageSrc, imageAlt, imageFit = "cover", signInHref, onClose }: Props) {
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 30);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !card) return;
      const items = Array.from(card.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !card.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      className={`${fredoka.variable} lg-back`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={cardRef}
        className="lg-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-learn-gate=""
      >
        <p className="lg-kicker">✦ For your family</p>
        <h2 id={titleId} className="lg-title">
          {title}
        </h2>
        <div className={`lg-preview${imageFit === "contain" ? " lg-preview--contain" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt={imageAlt} />
        </div>
        <p className="lg-msg">{message}</p>
        <div className="lg-actions">
          <button ref={closeRef} type="button" className="lg-btn lg-btn--close" onClick={onClose}>
            Close
          </button>
          <a className="lg-btn lg-btn--go" href={signInHref}>
            Sign in
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
