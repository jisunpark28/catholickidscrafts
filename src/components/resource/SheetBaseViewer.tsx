"use client";

import {
  defaultTextForField,
  type SheetEditField,
  type SheetLayout,
} from "@/lib/resource/sheet-base";
import type { SundaySheetContent } from "@/lib/sunday-sheet-content";
import { useMemo, useState } from "react";

type Props = {
  sheet: SundaySheetContent;
  level: 1 | 2;
  layout: SheetLayout;
  /** Public URL to base PNG (editable text already removed). */
  basePngUrl: string;
  /** When false, text is read-only preview of overlays. */
  editable?: boolean;
};

/**
 * Phase-2 consumer of Base PNG + layout JSON.
 * Renders locked base image and absolutely positioned text fields (Fabric arrives in Phase 3).
 */
export function SheetBaseViewer({ sheet, level, layout, basePngUrl, editable = false }: Props) {
  const initial = useMemo(() => {
    const o: Partial<Record<SheetEditField, string>> = {};
    for (const box of layout.boxes) {
      o[box.id] = defaultTextForField(sheet, level, box.id);
    }
    return o;
  }, [sheet, level, layout.boxes]);

  const [texts, setTexts] = useState(initial);
  const scale = 1;

  return (
    <div className="mx-auto w-full max-w-[816px]">
      <div
        className="relative overflow-hidden rounded-sm border border-[#ddd] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
        style={{ width: layout.page.width * scale, height: layout.page.height * scale }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={basePngUrl}
          alt=""
          width={layout.page.width}
          height={layout.page.height}
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
          draggable={false}
        />
        <div
          className="pointer-events-none absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[11px] font-medium text-white"
          title="Base layer is locked"
        >
          🔒 Base sheet locked · {layout.key}
        </div>
        {layout.boxes.map((box) => (
          <textarea
            key={box.id}
            readOnly={!editable}
            value={texts[box.id] ?? ""}
            onChange={(e) => setTexts((prev) => ({ ...prev, [box.id]: e.target.value }))}
            aria-label={box.id}
            className={`absolute resize-none overflow-hidden border border-transparent bg-transparent p-0 leading-snug text-[#111] outline-none focus:border-[#4c8bf5] focus:bg-white/80 ${
              editable ? "pointer-events-auto" : "pointer-events-none"
            }`}
            style={{
              left: box.left * scale,
              top: box.top * scale,
              width: Math.max(24, box.width * scale),
              height: Math.max(16, box.height * scale),
              fontSize: (box.fontSize ?? 15) * scale,
              fontFamily: '"Comic Neue","Comic Sans MS",sans-serif',
            }}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-[#6b7280]">
        Base rev {layout.rev} · {layout.boxes.length} editable fields · Fabric editor comes next
      </p>
    </div>
  );
}
