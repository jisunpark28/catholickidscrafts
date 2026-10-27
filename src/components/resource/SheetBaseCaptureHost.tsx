"use client";

import { GospelSheet } from "@/components/gospel-sheet/GospelSheet";
import { GOSPEL_SHEET_CSS } from "@/components/gospel-sheet/sheet-styles";
import { measureSheetLayout } from "@/components/resource/captureSheetBase";
import type { GospelSheetView } from "@/lib/gospel-sheet";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    __CKC_SHEET_BASE__?: {
      ready: boolean;
      capture: () => Promise<{ layout: unknown; pngDataUrl: string }>;
    };
  }
}

/** Headless capture host: base-variant sheet + window.__CKC_SHEET_BASE__.capture() (layout only). */
export function SheetBaseCaptureHost({
  sheet,
  level,
  rev,
  sheetKey,
}: {
  sheet: GospelSheetView;
  level: 1 | 2;
  rev: string;
  sheetKey: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const page = root.current?.querySelector("[data-sheet-page]") as HTMLElement | null;
      if (!page) return;
      window.__CKC_SHEET_BASE__ = {
        ready: true,
        capture: async () => ({
          layout: measureSheetLayout(page, { key: sheetKey, level, rev }),
          pngDataUrl: "",
        }),
      };
    }, 80);
    return () => {
      window.clearTimeout(t);
      delete window.__CKC_SHEET_BASE__;
    };
  }, [sheet, level, rev, sheetKey]);

  return (
    <div ref={root} style={{ background: "#eee", padding: 24 }}>
      <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_CSS }} />
      <GospelSheet sheet={sheet} level={level} variant="base" />
    </div>
  );
}
