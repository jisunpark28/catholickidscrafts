"use client";

import { measureSheetLayout } from "@/components/resource/captureSheetBase";
import { SheetFabricEditorLazy } from "@/components/resource/SheetFabricEditorLazy";
import { fallbackSheetLayout } from "@/lib/resource/fallback-layout";
import type { SheetLayout } from "@/lib/resource/sheet-base";
import type { SundaySheetContent } from "@/lib/sunday-sheet-content";
import { useEffect, useEffectEvent, useRef, useState } from "react";

type Props = {
  sheet: SundaySheetContent;
  level: 1 | 2;
  layout: SheetLayout | null;
  basePngUrl: string | null;
  baseRev: string;
  isPlus: boolean;
  initialCustomId?: string | null;
};

/**
 * Opens Fabric even without `public/sheet-bases` files.
 * Static PNG+JSON when present; otherwise HTML GospelSheet underlay + measured/fallback boxes.
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
  const useStatic = Boolean(staticLayout && staticPng);
  const measuredOnce = useRef(false);
  const [layout, setLayout] = useState<SheetLayout>(
    staticLayout ?? fallbackSheetLayout(sheet.key, level, baseRev),
  );

  useEffect(() => {
    measuredOnce.current = false;
    if (useStatic && staticLayout) {
      setLayout(staticLayout);
      return;
    }
    setLayout(fallbackSheetLayout(sheet.key, level, baseRev));
  }, [useStatic, staticLayout, sheet.key, level, baseRev]);

  const onBasePageReady = useEffectEvent((page: HTMLElement) => {
    if (useStatic || measuredOnce.current) return;
    measuredOnce.current = true;
    try {
      const measured = measureSheetLayout(page, {
        key: sheet.key,
        level,
        rev: baseRev,
      });
      if (measured.boxes.length > 0) setLayout(measured);
    } catch (e) {
      console.warn("[SheetFabricLiveBase] measure failed", e);
    }
  });

  return (
    <SheetFabricEditorLazy
      sheet={sheet}
      level={level}
      layout={layout}
      basePngUrl={useStatic ? staticPng : null}
      baseRev={baseRev}
      isPlus={isPlus}
      initialCustomId={initialCustomId}
      liveHtmlBase={!useStatic}
      onLiveBasePageReady={useStatic ? undefined : onBasePageReady}
    />
  );
}
