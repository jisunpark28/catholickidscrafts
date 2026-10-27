"use client";

import { SheetFabricEditorLazy } from "@/components/resource/SheetFabricEditorLazy";
import { fallbackSheetLayout } from "@/lib/resource/fallback-layout";
import type { SheetLayout } from "@/lib/resource/sheet-base";
import type { SundaySheetContent } from "@/lib/sunday-sheet-content";
import { Component, type ErrorInfo, type ReactNode, useMemo } from "react";

type Props = {
  sheet: SundaySheetContent;
  level: 1 | 2;
  layout: SheetLayout | null;
  basePngUrl: string | null;
  baseRev: string;
  isPlus: boolean;
  initialCustomId?: string | null;
};

class EditorErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state: { error: string | null } = { error: null };

  static getDerivedStateFromError(err: Error) {
    return { error: err?.message || "Editor crashed" };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error("[SheetFabricLiveBase]", err, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-6 text-sm text-[#4b5563]">
          <p className="m-0 font-semibold text-[#1c1c1c]">Could not open the editor</p>
          <p className="mb-0 mt-2">{this.state.error}</p>
          <p className="mb-0 mt-3 text-xs text-[#6b7280]">Try refreshing the page. If it keeps happening, use Print on the sheet page instead.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Opens Fabric with a live GospelSheet HTML underlay so every text node
 * (headers, activity copy, chrome) can be measured and edited — not only
 * the core SHEET_EDIT_FIELDS baked into static sheet-bases JSON.
 */
export function SheetFabricLiveBase({
  sheet,
  level,
  layout: staticLayout,
  basePngUrl: _staticPng,
  baseRev,
  isPlus,
  initialCustomId = null,
}: Props) {
  void _staticPng;
  const layout = useMemo(
    () => staticLayout ?? fallbackSheetLayout(sheet.key, level, baseRev),
    [staticLayout, sheet.key, level, baseRev],
  );

  return (
    <EditorErrorBoundary>
      <SheetFabricEditorLazy
        sheet={sheet}
        level={level}
        layout={layout}
        basePngUrl={null}
        baseRev={baseRev}
        isPlus={isPlus}
        initialCustomId={initialCustomId}
        liveHtmlBase
      />
    </EditorErrorBoundary>
  );
}
