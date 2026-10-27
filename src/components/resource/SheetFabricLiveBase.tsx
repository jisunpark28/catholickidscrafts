"use client";

import { GospelSheet } from "@/components/gospel-sheet/GospelSheet";
import { GOSPEL_SHEET_CSS } from "@/components/gospel-sheet/sheet-styles";
import { captureSheetBase } from "@/components/resource/captureSheetBase";
import { SheetFabricEditorLazy } from "@/components/resource/SheetFabricEditorLazy";
import type { SheetLayout } from "@/lib/resource/sheet-base";
import { toGospelSheetView, type SundaySheetContent } from "@/lib/sunday-sheet-content";
import { useEffect, useRef, useState } from "react";

type Props = {
  sheet: SundaySheetContent;
  level: 1 | 2;
  /** Prebuilt layout from public/sheet-bases when available. */
  layout: SheetLayout | null;
  /** Public PNG URL when available. */
  basePngUrl: string | null;
  baseRev: string;
  isPlus: boolean;
  initialCustomId?: string | null;
};

/**
 * Fabric editor that works without committed base PNGs:
 * if static assets are missing, render GospelSheet(variant=base) off-screen,
 * measure + rasterize in the browser, then mount the editor.
 */
export function SheetFabricLiveBase({
  sheet,
  level,
  layout: staticLayout,
  basePngUrl: staticPng,
  baseRev,
  isPlus,
  initialCustomId = null,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState<{ layout: SheetLayout; png: string } | null>(
    staticLayout && staticPng ? { layout: staticLayout, png: staticPng } : null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (staticLayout && staticPng) {
      setReady({ layout: staticLayout, png: staticPng });
      return;
    }
    let cancelled = false;
    const run = async () => {
      const page = hostRef.current?.querySelector(".gs-page") as HTMLElement | null;
      if (!page) {
        setError("Could not prepare the sheet for editing.");
        return;
      }
      // Wait a frame so fonts/layout settle.
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      try {
        const captured = await captureSheetBase(page, {
          key: sheet.key,
          level,
          rev: baseRev,
        });
        if (cancelled) return;
        if (!captured.layout.boxes.length) {
          setError("Could not measure editable fields on this sheet.");
          return;
        }
        setReady({ layout: captured.layout, png: captured.pngDataUrl });
      } catch (e) {
        console.error("[SheetFabricLiveBase]", e);
        if (!cancelled) setError("Could not build the editable base. Try refreshing.");
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [staticLayout, staticPng, sheet.key, level, baseRev]);

  if (ready) {
    return (
      <SheetFabricEditorLazy
        sheet={sheet}
        level={level}
        layout={ready.layout}
        basePngUrl={ready.png}
        baseRev={baseRev}
        isPlus={isPlus}
        initialCustomId={initialCustomId}
      />
    );
  }

  const view = { ...toGospelSheetView(sheet), sundayLabel: sheet.key };

  return (
    <div>
      {!error ? (
        <div className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-8 text-center text-sm text-[#6b7280]">
          Preparing editable base…
        </div>
      ) : (
        <div className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-4 text-sm text-[#6b7280]">
          {error}
        </div>
      )}
      {/* Off-screen capture host (must stay mounted until capture finishes). */}
      <div
        ref={hostRef}
        aria-hidden
        className="pointer-events-none fixed left-[-10000px] top-0 overflow-hidden"
        style={{ width: "8.5in" }}
      >
        <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_CSS }} />
        <GospelSheet sheet={view} level={level} variant="base" />
      </div>
    </div>
  );
}
