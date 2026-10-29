"use client";

import { useLayoutEffect, useRef, useState } from "react";

/** Letter page width at 96dpi plus a little room for the page shadow. */
const PAGE_PX = 836;
/** Letter height (11in) + vertical page margin from `.gs-page`. */
const PAGE_H_PX = 1056 + 32;

/** Scales the 8.5in sheet down to fit narrow screens; full size when there is room. */
export function SheetFit({ children }: { children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const o = outer.current;
    if (!o) return;
    const update = () => setScale(Math.min(1, o.clientWidth / PAGE_PX));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(o);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={outer}
      className="relative w-full overflow-hidden"
      style={{ height: PAGE_H_PX * scale }}
    >
      <div
        style={{
          width: PAGE_PX,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          marginLeft: scale < 1 ? 0 : "auto",
          marginRight: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
