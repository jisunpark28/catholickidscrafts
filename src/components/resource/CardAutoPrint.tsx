"use client";

import { useEffect } from "react";

/** Opens the print dialog once the card image has loaded (or after 8 s). Renders nothing. */
export function CardAutoPrint() {
  useEffect(() => {
    const img = document.querySelector<HTMLImageElement>("img[data-card-print]");
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      window.setTimeout(() => window.print(), 250);
    };
    if (!img || img.complete) {
      go();
      return;
    }
    img.addEventListener("load", go, { once: true });
    img.addEventListener("error", go, { once: true });
    const t = window.setTimeout(go, 8000);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}
