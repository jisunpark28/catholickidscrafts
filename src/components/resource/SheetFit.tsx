"use client";

import { useLayoutEffect, useRef, useState } from "react";

/** Letter page width at 96dpi plus a little room for the page shadow. */
const PAGE_PX = 836;

/** Scales the 8.5in sheet down to fit narrow screens; full size when there is room. */
export function SheetFit({ children }: { children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ scale: number; height: number | null }>({ scale: 1, height: null });

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const update = () => {
      const scale = Math.min(1, o.clientWidth / PAGE_PX);
      setFit({ scale, height: i.scrollHeight * scale });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(o);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} style={{ width: "100%", height: fit.height ?? undefined, overflow: "hidden" }}>
      <div
        ref={inner}
        style={{
          width: PAGE_PX,
          transform: `scale(${fit.scale})`,
          transformOrigin: "top left",
          marginLeft: fit.scale < 1 ? 0 : "auto",
          marginRight: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
