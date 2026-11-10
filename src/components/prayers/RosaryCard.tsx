"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RosaryPrayer } from "./RosaryPrayer";
import "@/styles/rosary.css";

/** Prayer grid card that opens the full-screen interactive Rosary (same look as the other prayer cards). */
export function RosaryCard() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const check = () => { if (window.location.hash === "#rosary") setOpen(true); };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => btnRef.current?.focus());
  }, []);

  return (
    <li>
      <div className="qa-card" data-qa-card="rosary" style={{ "--qa-p": "#E6F4EA" } as React.CSSProperties}>
        <div className="qa-inner">
          <button
            ref={btnRef}
            type="button"
            className="qa-face qa-front"
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
          >
            <span className="qa-ill">
              <span className="qa-emoji" aria-hidden>📿</span>
            </span>
            <span className="qa-q">The Rosary</span>
            <span className="qa-hint">Tap to pray ↻</span>
          </button>
        </div>
      </div>
      <RosaryPrayer open={open} onClose={close} />
    </li>
  );
}
