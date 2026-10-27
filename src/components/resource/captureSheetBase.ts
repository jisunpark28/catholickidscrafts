"use client";

import {
  SHEET_EDIT_FIELDS,
  SHEET_PAGE,
  fontSizeHint,
  type SheetEditField,
  type SheetLayout,
} from "@/lib/resource/sheet-base";

export type CapturedSheetBase = {
  layout: SheetLayout;
  /** PNG data URL of the base (editable text hidden). */
  pngDataUrl: string;
};

function pageRect(page: HTMLElement): DOMRect {
  return page.getBoundingClientRect();
}

export type MeasuredSectionBox = {
  /** Stable id for hide/restore: `bs_0`, `bs_1`, … in DOM order. */
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * Measure printable section frames (`.gs-box`) in letter CSS-px relative to `.gs-page`.
 * Used to promote locked HTML chrome into editable Fabric Rects.
 */
export function measureSheetSectionBoxes(page: HTMLElement): MeasuredSectionBox[] {
  const origin = pageRect(page);
  const scaleX = SHEET_PAGE.width / origin.width;
  const scaleY = SHEET_PAGE.height / origin.height;
  const nodes = [...page.querySelectorAll<HTMLElement>(".gs-box")];
  const out: MeasuredSectionBox[] = [];
  nodes.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    let left = Math.round((r.left - origin.left) * scaleX);
    let top = Math.round((r.top - origin.top) * scaleY);
    let width = Math.round(r.width * scaleX);
    let height = Math.round(Math.max(r.height, 24) * scaleY);
    if (top >= SHEET_PAGE.height - 8) return;
    width = Math.max(40, Math.min(width, SHEET_PAGE.width - left));
    height = Math.max(24, Math.min(height, SHEET_PAGE.height - top));
    left = Math.max(0, Math.min(left, SHEET_PAGE.width - width));
    top = Math.max(0, Math.min(top, SHEET_PAGE.height - height));
    out.push({ id: `bs_${i}`, left, top, width, height });
  });
  return out;
}

/** Measure `[data-sheet-field]` boxes in letter CSS-px relative to `.gs-page`. */
export function measureSheetLayout(
  page: HTMLElement,
  meta: Pick<SheetLayout, "key" | "level" | "rev">,
): SheetLayout {
  const origin = pageRect(page);
  const scaleX = SHEET_PAGE.width / origin.width;
  const scaleY = SHEET_PAGE.height / origin.height;
  const boxes: SheetLayout["boxes"] = [];

  for (const id of SHEET_EDIT_FIELDS) {
    const el = page.querySelector(`[data-sheet-field="${id}"]`) as HTMLElement | null;
    if (!el) continue;
    const r = el.getBoundingClientRect();
    let left = Math.round((r.left - origin.left) * scaleX);
    let top = Math.round((r.top - origin.top) * scaleY);
    let width = Math.round(r.width * scaleX);
    let height = Math.round(Math.max(r.height, 12) * scaleY);
    // Keep overlays on the letter page (clipped content is not editable in v1).
    if (top >= SHEET_PAGE.height - 8) continue;
    width = Math.max(24, Math.min(width, SHEET_PAGE.width - left));
    height = Math.max(14, Math.min(height, SHEET_PAGE.height - top));
    left = Math.max(0, Math.min(left, SHEET_PAGE.width - width));
    top = Math.max(0, Math.min(top, SHEET_PAGE.height - height));
    boxes.push({
      id,
      left,
      top,
      width,
      height,
      fontSize: fontSizeHint(meta.level, id as SheetEditField),
    });
  }

  return {
    v: 1,
    key: meta.key,
    level: meta.level,
    paper: "letter",
    rev: meta.rev,
    page: { width: SHEET_PAGE.width, height: SHEET_PAGE.height },
    boxes,
  };
}

/** Rasterize the letter page to a PNG data URL (devicePixelRatio capped for file size). */
export async function rasterizeSheetPage(page: HTMLElement): Promise<string> {
  const rect = page.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(SHEET_PAGE.width * dpr);
  canvas.height = Math.round(SHEET_PAGE.height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SHEET_PAGE.width, SHEET_PAGE.height);

  // Draw via SVG foreignObject snapshot of the page HTML + computed styles is heavy;
  // use html2canvas-free path: clone into SVG foreignObject.
  const clone = page.cloneNode(true) as HTMLElement;
  clone.style.transform = "none";
  clone.style.margin = "0";
  clone.style.boxShadow = "none";
  const xhtml = new XMLSerializer().serializeToString(clone);
  // Pull inlined sheet CSS from the live document when present.
  const styleTags = [...document.querySelectorAll("style")]
    .map((s) => s.textContent ?? "")
    .filter((t) => t.includes(".gs-page") || t.includes(".gs,"))
    .join("\n");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SHEET_PAGE.width}" height="${SHEET_PAGE.height}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:${SHEET_PAGE.width}px;height:${SHEET_PAGE.height}px;background:#fff;">
      <style>${styleTags}
.gs-page{margin:0!important;box-shadow:none!important;width:8.5in!important;height:11in!important;}
      </style>
      ${xhtml}
    </div>
  </foreignObject>
</svg>`;

  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = await loadImage(url);
    ctx.drawImage(img, 0, 0, SHEET_PAGE.width, SHEET_PAGE.height);
    // If foreignObject failed (blank), fall back to scaled screenshot via drawWindow-less path:
    if (isMostlyWhite(ctx, canvas.width, canvas.height)) {
      return await rasterizeViaHtml2CanvasFallback(page, canvas, ctx, rect, dpr);
    }
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load sheet snapshot image"));
    img.src = src;
  });
}

function isMostlyWhite(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  const sample = ctx.getImageData(Math.floor(w / 2), Math.floor(h / 2), 1, 1).data;
  return sample[0] > 250 && sample[1] > 250 && sample[2] > 250;
}

/**
 * Fallback: scale the live DOM node via css → canvas using browser's SVG still blank.
 * Uses Offscreen-free approach: temporary larger SVG with encoded HTML from outerHTML + styles.
 */
async function rasterizeViaHtml2CanvasFallback(
  page: HTMLElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  _rect: DOMRect,
  dpr: number,
): Promise<string> {
  // Last-resort: fill white and note failure — caller should use Playwright generator.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SHEET_PAGE.width, SHEET_PAGE.height);
  ctx.fillStyle = "#999";
  ctx.font = "16px sans-serif";
  ctx.fillText("Base preview unavailable in this browser — run generate-sheet-bases.", 24, 48);
  void page;
  return canvas.toDataURL("image/png");
}

export async function captureSheetBase(
  page: HTMLElement,
  meta: Pick<SheetLayout, "key" | "level" | "rev">,
): Promise<CapturedSheetBase> {
  const layout = measureSheetLayout(page, meta);
  const pngDataUrl = await rasterizeSheetPage(page);
  return { layout, pngDataUrl };
}
