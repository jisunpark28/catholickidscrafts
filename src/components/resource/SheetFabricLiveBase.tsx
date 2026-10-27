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
 * Opens Fabric even without `public/sheet-bases` files.
 * Static PNG+JSON when present; otherwise HTML underlay + fallback box layout.
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
        basePngUrl={useStatic ? staticPng : null}
        baseRev={baseRev}
        isPlus={isPlus}
        initialCustomId={initialCustomId}
        liveHtmlBase={!useStatic}
      />
    </EditorErrorBoundary>
  );
}
