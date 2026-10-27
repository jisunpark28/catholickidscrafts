"use client";

import { GospelSheet } from "@/components/gospel-sheet/GospelSheet";
import type { GospelSheetView } from "@/lib/gospel-sheet";
import { useLayoutEffect, useRef, useState } from "react";

/** Letter page width at 96dpi (matches SheetFit). */
const PAGE_W = 816;

/**
 * Tiny live preview of a Gospel sheet for search cards.
 * Scales the real letter page into a fixed card frame (mockup thumbnails).
 */
export function SheetThumb({
  sheet,
  level,
}: {
  sheet: GospelSheetView;
  level: 1 | 2;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.22);

  useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / PAGE_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Letter height ≈ 1056px; clip after scale so cards stay even.
  const frameH = Math.round(1056 * scale);

  return (
    <div
      ref={outer}
      className="overflow-hidden rounded-xl border border-[#ece7e1] bg-white shadow-[0_1px_2px_rgba(28,28,28,0.04)]"
      style={{ height: frameH || 180 }}
      aria-hidden
    >
      <div
        style={{
          width: PAGE_W,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <GospelSheet sheet={sheet} level={level} />
      </div>
    </div>
  );
}
