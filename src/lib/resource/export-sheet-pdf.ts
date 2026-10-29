import type { Canvas } from "fabric";
import { SHEET_PAGE } from "@/lib/resource/sheet-base";

/** Letter @ 300dpi raster for PNG/PDF downloads. */
export const SHEET_PRINT_DPI = 300;
export const SHEET_CSS_DPI = 96;
export const SHEET_EXPORT_MULTIPLIER = SHEET_PRINT_DPI / SHEET_CSS_DPI;

function hideControls(canvas: Canvas): () => void {
  const prev = canvas.getActiveObject();
  canvas.discardActiveObject();
  const objs = canvas.getObjects();
  const flags = objs.map((o) => ({ o, hasControls: o.hasControls, hasBorders: o.hasBorders }));
  for (const o of objs) o.set({ hasControls: false, hasBorders: false });
  canvas.requestRenderAll();
  return () => {
    for (const f of flags) f.o.set({ hasControls: f.hasControls, hasBorders: f.hasBorders });
    if (prev) canvas.setActiveObject(prev);
    canvas.requestRenderAll();
  };
}

/**
 * Flatten the sheet for export: white paper → underlay image (live HTML snapshot or static
 * base PNG) → Fabric objects. The editor canvas itself is transparent, so exporting it alone
 * would drop the activity graphics (and turn black in JPEG).
 */
export function composeSheetCanvas(
  canvas: Canvas,
  underlay: CanvasImageSource | null,
  multiplier = SHEET_EXPORT_MULTIPLIER,
): HTMLCanvasElement {
  const restore = hideControls(canvas);
  try {
    const W = Math.round(SHEET_PAGE.width * multiplier);
    const H = Math.round(SHEET_PAGE.height * multiplier);
    const out = document.createElement("canvas");
    out.width = W;
    out.height = H;
    const ctx = out.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    if (underlay) ctx.drawImage(underlay, 0, 0, W, H);
    const top = canvas.toCanvasElement(multiplier);
    ctx.drawImage(top, 0, 0, W, H);
    return out;
  } finally {
    restore();
  }
}

function clickDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

/** Download a ~300dpi PNG of the flattened sheet. */
export function downloadSheetPng(canvas: Canvas, underlay: CanvasImageSource | null, filename: string) {
  const flat = composeSheetCanvas(canvas, underlay);
  clickDownload(flat.toDataURL("image/png"), filename.endsWith(".png") ? filename : `${filename}.png`);
}

/** Letter PDF via jsPDF with a 300dpi JPEG of the flattened sheet (white background). */
export async function downloadSheetPdf(canvas: Canvas, underlay: CanvasImageSource | null, filename: string) {
  const { jsPDF } = await import("jspdf");
  const flat = composeSheetCanvas(canvas, underlay);
  const dataUrl = flat.toDataURL("image/jpeg", 0.92);
  const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: "letter", compress: true });
  pdf.addImage(dataUrl, "JPEG", 0, 0, SHEET_PAGE.width / SHEET_CSS_DPI, SHEET_PAGE.height / SHEET_CSS_DPI);
  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
