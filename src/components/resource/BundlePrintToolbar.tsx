"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Screen-only bar for the bundle print view; auto-print waits for the card image. */
export function BundlePrintToolbar({ autoPrint, backHref, title }: { autoPrint: boolean; backHref: string; title: string }) {
  useEffect(() => {
    if (!autoPrint) return;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      window.setTimeout(() => window.print(), 300);
    };
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("img[data-bundle-img]"));
    const pending = imgs.filter((i) => !i.complete);
    if (!pending.length) go();
    else {
      let left = pending.length;
      pending.forEach((i) => {
        const fin = () => {
          left -= 1;
          if (left <= 0) go();
        };
        i.addEventListener("load", fin, { once: true });
        i.addEventListener("error", fin, { once: true });
      });
      // Never hang: print after 8 s even if the card is slow.
      const t = window.setTimeout(go, 8000);
      return () => window.clearTimeout(t);
    }
  }, [autoPrint]);

  return (
    <div
      className="gs-screen-only"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 9,
        background: "#fff",
        borderBottom: "1px solid #ccc",
        padding: "10px 16px",
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <button
        type="button"
        onClick={() => window.print()}
        style={{ fontSize: 18, padding: "10px 22px", background: "#d35400", color: "#fff", border: 0, borderRadius: 10, cursor: "pointer" }}
      >
        🖨 Print / Save as PDF
      </button>
      <span style={{ fontSize: 14, color: "#555" }}>{title} · choose “Save as PDF” in the print dialog for a PDF file.</span>
      <Link href={backHref} style={{ marginLeft: "auto", fontSize: 15, color: "#111" }}>
        ← Back
      </Link>
    </div>
  );
}
