"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  slug: string;
  level: 1 | 2;
  gospelRef: string;
  usccbUrl: string;
  autoPrint: boolean;
  /** Level links go to `${basePath}?level=N`. Defaults to the DB sheet route /print/<slug>. */
  basePath?: string;
  /** Optional "Back" link (e.g. to the Resource page). */
  backHref?: string;
};

const btn: React.CSSProperties = {
  fontSize: 15,
  padding: "8px 14px",
  border: "1px solid #888",
  borderRadius: 8,
  background: "#fff",
  color: "#111",
  textDecoration: "none",
};

/** Screen-only bar on the print page (hidden when printing). */
export function PrintToolbar({ slug, level, gospelRef, usccbUrl, autoPrint, basePath, backHref }: Props) {
  useEffect(() => {
    if (!autoPrint) return;
    const t = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(t);
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
        style={{
          fontSize: 20,
          padding: "12px 28px",
          background: "#2e7d32",
          color: "#fff",
          border: 0,
          borderRadius: 8,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        🖨 Print
      </button>
      {([1, 2] as const).map((n) => (
        <Link
          key={n}
          href={`${basePath ?? `/print/${slug}`}?level=${n}`}
          replace
          style={n === level ? { ...btn, background: "#111", color: "#fff" } : btn}
          aria-current={n === level ? "page" : undefined}
        >
          Level {n}
        </Link>
      ))}
      {backHref ? (
        <Link href={backHref} style={btn}>
          ← Back
        </Link>
      ) : null}
      {usccbUrl ? (
        <span style={{ marginLeft: "auto", fontSize: 13 }}>
          Read the Gospel:{" "}
          <a href={usccbUrl} target="_blank" rel="noopener noreferrer">
            {gospelRef} (USCCB)
          </a>
        </span>
      ) : null}
    </div>
  );
}
