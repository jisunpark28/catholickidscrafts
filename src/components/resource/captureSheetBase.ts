"use client";

import {
  SHEET_EDIT_FIELDS,
  SHEET_PAGE,
  fontSizeHint,
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
export function measureSheetSectionBoxes(
  page: HTMLElement,
  originEl?: HTMLElement | null,
): MeasuredSectionBox[] {
  const origin = pageRect(originEl && originEl.isConnected ? originEl : page);
  const ow = Math.max(1, origin.width);
  const oh = Math.max(1, origin.height);
  const scaleX = SHEET_PAGE.width / ow;
  const scaleY = SHEET_PAGE.height / oh;
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

export type MeasuredTextField = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
};

export type MeasuredChrome = {
  /** Stable id: `wl_0`, `chk_0`, … */
  id: string;
  kind: "writeline" | "checkbox";
  left: number;
  top: number;
  width: number;
  height: number;
};

function scaleOrigin(originEl: HTMLElement | null | undefined, page: HTMLElement) {
  const origin = pageRect(originEl && originEl.isConnected ? originEl : page);
  const ow = Math.max(1, origin.width);
  const oh = Math.max(1, origin.height);
  return {
    origin,
    scaleX: SHEET_PAGE.width / ow,
    scaleY: SHEET_PAGE.height / oh,
  };
}

/**
 * Measure printable chrome that isn't text: dotted write-lines and checklist boxes.
 * Hides sources via `.gs-edit-chrome` (caller) / visibility so Fabric can replace them.
 */
export function collectSheetChrome(
  page: HTMLElement,
  originEl?: HTMLElement | null,
): MeasuredChrome[] {
  const { origin, scaleX, scaleY } = scaleOrigin(originEl, page);
  const out: MeasuredChrome[] = [];
  let wi = 0;
  let ci = 0;

  page.querySelectorAll<HTMLElement>(".gs-wl, [data-sheet-chrome='writeline']").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 8) return;
    const left = Math.round((r.left - origin.left) * scaleX);
    const top = Math.round((r.top - origin.top + Math.max(r.height - 2, 0)) * scaleY);
    const width = Math.round(r.width * scaleX);
    const box = clampBox(left, top - 1, width, 4);
    if (!box) return;
    el.style.visibility = "hidden";
    el.style.borderColor = "transparent";
    out.push({
      id: `wl_${wi++}`,
      kind: "writeline",
      left: box.left,
      top: box.top,
      width: box.width,
      height: 2,
    });
  });

  // Explicit checkbox nodes (preferred) or legacy ::before on .gs-chk > li
  const chkNodes = page.querySelectorAll<HTMLElement>(".gs-chk-box, [data-sheet-chrome='checkbox']");
  if (chkNodes.length) {
    chkNodes.forEach((el) => {
      const r = el.getBoundingClientRect();
      const size = Math.max(12, Math.round(Math.min(r.width || 16, r.height || 16) * scaleX));
      const box = clampBox(
        Math.round((r.left - origin.left) * scaleX),
        Math.round((r.top - origin.top) * scaleY),
        size,
        size,
      );
      if (!box) return;
      el.style.visibility = "hidden";
      out.push({ id: `chk_${ci++}`, kind: "checkbox", ...box });
    });
  } else {
    page.querySelectorAll<HTMLElement>(".gs-chk > li").forEach((el) => {
      const r = el.getBoundingClientRect();
      const size = Math.round(16 * scaleX);
      const box = clampBox(
        Math.round((r.left - origin.left) * scaleX),
        Math.round((r.top - origin.top) * scaleY) + 2,
        size,
        size,
      );
      if (!box) return;
      out.push({ id: `chk_${ci++}`, kind: "checkbox", ...box });
    });
  }

  return out;
}

/** HTML selectors for chrome + activity copy not always pre-tagged. */
const AUTO_TEXT_SELECTORS = [
  ".gs-sub",
  ".gs-meta",
  ".gs-box > h2",
  ".gs-act > h2",
  ".gs-act > [data-sheet-field='actIntro']",
  ".gs-act p",
  ".gs-act li",
  ".gs-act .gs-act-chip",
  ".gs-act .gs-act-bingo > div",
  ".gs-act .gs-act-find",
  ".gs-act .gs-act-letters",
  ".gs-act .gs-act-mitem",
  ".gs-act .gs-act-prompt",
  ".gs-act .gs-act-basket",
  ".gs-act .gs-act-frame > p",
  ".gs-act .gs-act-pline",
  ".gs-act th",
  ".gs-act td",
  ".gs-act .gs-act-keycell",
  ".gs-act b",
  "footer",
] as const;

const SKIP_CLASS = /\b(gs-ph|gs-wl|gs-act-fill|gs-act-blank|gs-act-draw|gs-act-drawscene|gs-dot|gs-act-num)\b/;

function clampBox(
  left: number,
  top: number,
  width: number,
  height: number,
): { left: number; top: number; width: number; height: number } | null {
  if (top >= SHEET_PAGE.height - 8) return null;
  width = Math.max(24, Math.min(width, SHEET_PAGE.width - left));
  height = Math.max(14, Math.min(height, SHEET_PAGE.height - top));
  left = Math.max(0, Math.min(left, SHEET_PAGE.width - width));
  top = Math.max(0, Math.min(top, SHEET_PAGE.height - height));
  return { left, top, width, height };
}

function plainText(el: Element): string {
  return (el.textContent || "").replace(/\s+/g, " ").trim();
}

function readFontSize(el: Element, level: 1 | 2, id: string): number {
  try {
    const raw = getComputedStyle(el).fontSize;
    const n = parseFloat(raw);
    if (Number.isFinite(n) && n >= 8 && n <= 96) return Math.round(n);
  } catch {
    /* ignore */
  }
  return fontSizeHint(level, id);
}

function shouldSkip(el: HTMLElement): boolean {
  if (SKIP_CLASS.test(el.className?.toString?.() ?? "")) return true;
  if (el.getAttribute("aria-hidden") === "true") return true;
  if (el.closest(".gs-ph")) return true;
  return false;
}

/**
 * Discover every editable text node on the live sheet underlay: explicit
 * `[data-sheet-field]` plus common chrome/activity labels and SVG labels.
 * Hides each source element so Fabric Textboxes can replace them.
 *
 * @param originEl Optional element whose top-left maps to Fabric (0,0).
 *   Prefer the editor host (same box as the canvas) so page margins don't shift overlays.
 */
export function collectEditableTextFields(
  page: HTMLElement,
  level: 1 | 2,
  originEl?: HTMLElement | null,
): MeasuredTextField[] {
  const origin = pageRect(originEl && originEl.isConnected ? originEl : page);
  const ow = Math.max(1, origin.width);
  const oh = Math.max(1, origin.height);
  const scaleX = SHEET_PAGE.width / ow;
  const scaleY = SHEET_PAGE.height / oh;
  const seen = new Set<Element>();
  const tagged: { el: Element; id: string }[] = [];

  page.querySelectorAll("[data-sheet-field]").forEach((el) => {
    const id = el.getAttribute("data-sheet-field")?.trim();
    if (!id || seen.has(el)) return;
    if (el instanceof HTMLElement && shouldSkip(el)) return;
    seen.add(el);
    tagged.push({ el, id });
  });

  let auto = 0;
  for (const sel of AUTO_TEXT_SELECTORS) {
    page.querySelectorAll(sel).forEach((el) => {
      if (seen.has(el)) return;
      if (!(el instanceof HTMLElement)) return;
      if (shouldSkip(el)) return;
      if (el.closest("svg")) return;
      // Skip wrappers that already contain a tagged field (avoid double boxes).
      if (el.querySelector("[data-sheet-field]")) return;
      if (el.closest("[data-sheet-field]") && !el.hasAttribute("data-sheet-field")) return;
      const text = plainText(el);
      if (text.length < 1) return;
      const id = el.getAttribute("data-sheet-field")?.trim() || `auto_${auto++}`;
      if (!el.hasAttribute("data-sheet-field")) el.setAttribute("data-sheet-field", id);
      seen.add(el);
      tagged.push({ el, id });
    });
  }

  // SVG labels (speech bubbles, faces, etc.)
  page.querySelectorAll("svg text").forEach((el) => {
    if (seen.has(el)) return;
    const text = plainText(el);
    if (text.length < 1) return;
    const id = el.getAttribute("data-sheet-field")?.trim() || `svg_${auto++}`;
    if (!el.hasAttribute("data-sheet-field")) el.setAttribute("data-sheet-field", id);
    seen.add(el);
    tagged.push({ el, id });
  });

  const out: MeasuredTextField[] = [];
  for (const { el, id } of tagged) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 && r.height < 2) continue;
    const box = clampBox(
      Math.round((r.left - origin.left) * scaleX),
      Math.round((r.top - origin.top) * scaleY),
      Math.round(Math.max(r.width, 24) * scaleX),
      Math.round(Math.max(r.height, 12) * scaleY),
    );
    if (!box) continue;
    const text = plainText(el);
    if (!text) continue;
    if (el instanceof HTMLElement) {
      el.style.visibility = "hidden";
    } else if (el instanceof SVGElement) {
      el.style.visibility = "hidden";
    }
    out.push({
      id,
      ...box,
      text,
      fontSize: readFontSize(el, level, id),
    });
  }
  return out;
}

/** Measure `[data-sheet-field]` boxes in letter CSS-px relative to `.gs-page`. */
export function measureSheetLayout(
  page: HTMLElement,
  meta: Pick<SheetLayout, "key" | "level" | "rev">,
): SheetLayout {
  const fields = collectEditableTextFields(page, meta.level);
  const core = new Set<string>(SHEET_EDIT_FIELDS);
  const boxes: SheetLayout["boxes"] = fields.map((f) => ({
    id: f.id,
    left: f.left,
    top: f.top,
    width: f.width,
    height: f.height,
    fontSize: f.fontSize,
    text: f.text,
  }));
  boxes.sort((a, b) => {
    const ac = core.has(a.id) ? 0 : 1;
    const bc = core.has(b.id) ? 0 : 1;
    return ac - bc || a.id.localeCompare(b.id);
  });

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

  const clone = page.cloneNode(true) as HTMLElement;
  clone.style.transform = "none";
  clone.style.margin = "0";
  clone.style.boxShadow = "none";
  const xhtml = new XMLSerializer().serializeToString(clone);
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

async function rasterizeViaHtml2CanvasFallback(
  page: HTMLElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  _rect: DOMRect,
  dpr: number,
): Promise<string> {
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
