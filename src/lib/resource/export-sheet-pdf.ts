import type { Canvas } from "fabric";
import { SHEET_PAGE } from "@/lib/resource/sheet-base";

/** Letter @ 300dpi — fallback raster when vector path is unavailable. */
export const SHEET_PRINT_DPI = 300;
export const SHEET_CSS_DPI = 96;
export const SHEET_EXPORT_MULTIPLIER = SHEET_PRINT_DPI / SHEET_CSS_DPI;

function hideControls(canvas: Canvas): () => void {
  const prev = canvas.getActiveObject();
  canvas.discardActiveObject();
  const objs = canvas.getObjects();
  const flags = objs.map((o) => ({
    o,
    selectable: o.selectable,
    evented: o.evented,
    hasControls: o.hasControls,
    hasBorders: o.hasBorders,
  }));
  for (const o of objs) {
    o.set({ hasControls: false, hasBorders: false });
  }
  canvas.requestRenderAll();
  return () => {
    for (const f of flags) {
      f.o.set({
        selectable: f.selectable,
        evented: f.evented,
        hasControls: f.hasControls,
        hasBorders: f.hasBorders,
      });
    }
    if (prev) canvas.setActiveObject(prev);
    canvas.requestRenderAll();
  };
}

/** Download a ~300dpi PNG of the current sheet (handles/selection hidden). */
export function downloadSheetPng(canvas: Canvas, filename: string) {
  const restore = hideControls(canvas);
  try {
    const dataUrl = canvas.toDataURL({
      format: "png",
      multiplier: SHEET_EXPORT_MULTIPLIER,
      enableRetinaScaling: false,
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
    a.click();
  } finally {
    restore();
  }
}

/**
 * Export Letter PDF via jsPDF + 300dpi JPEG raster (photos stay sharp enough for home print).
 * Full SVG→vector PDF can replace this later without changing the editor UI.
 */
export async function downloadSheetPdf(canvas: Canvas, filename: string) {
  const { jsPDF } = await import("jspdf");
  const restore = hideControls(canvas);
  try {
    const dataUrl = canvas.toDataURL({
      format: "jpeg",
      quality: 0.92,
      multiplier: SHEET_EXPORT_MULTIPLIER,
      enableRetinaScaling: false,
    });
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: "letter",
      compress: true,
    });
    const wIn = SHEET_PAGE.width / SHEET_CSS_DPI;
    const hIn = SHEET_PAGE.height / SHEET_CSS_DPI;
    pdf.addImage(dataUrl, "JPEG", 0, 0, wIn, hIn);
    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  } finally {
    restore();
  }
}
