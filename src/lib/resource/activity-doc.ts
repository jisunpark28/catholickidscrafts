// Editable activity sheet document: one element per line, dot, shape and text, in PDF points
// (US Letter 612 x 792, origin top-left, y down: the same space as the SVG viewBox).
// Pure and client-safe (used by the editor, its PDF export and the API route types).
import type { ActivityVariant } from "@/lib/resource/activities";

export type LineCap = "butt" | "round" | "square";
export type LineJoin = "miter" | "round" | "bevel";
export type FontKey = "baloo" | "comic";

type Base = {
  id: string;
  /** Shown in the layer list ("Dot", "Text: Advent"). */
  name: string;
  /** Part of the sheet it belongs to ("Wheel", "Doodle: star"). */
  group: string;
  /** "none" or #rrggbb */
  fill: string;
  stroke: string;
  strokeWidth?: number;
  lineCap?: LineCap;
  lineJoin?: LineJoin;
  /** B&W / colour fills of the original sheet; switching the variant applies these. */
  palette?: Record<ActivityVariant, string>;
  /** Move / resize: page point = (sx * x + tx, sy * y + ty). Omitted = identity. */
  tx?: number;
  ty?: number;
  sx?: number;
  sy?: number;
};

export type PathEl = Base & { kind: "path"; d: string };
export type LineEl = Base & { kind: "line"; x1: number; y1: number; x2: number; y2: number };
export type RectEl = Base & { kind: "rect"; x: number; y: number; w: number; h: number; rx: number };
export type CircleEl = Base & { kind: "circle"; cx: number; cy: number; r: number };
export type TextEl = Base & {
  kind: "text";
  x: number;
  y: number;
  text: string;
  fontFamily: FontKey;
  fontWeight: 400 | 700;
  fontSize: number;
  anchor: "start" | "middle" | "end";
};

export type ActivityEl = PathEl | LineEl | RectEl | CircleEl | TextEl;
export type ElKind = ActivityEl["kind"];

export type ActivityDoc = {
  version: 1;
  slug: string;
  title: string;
  width: number;
  height: number;
  variant: ActivityVariant;
  elements: ActivityEl[];
};

export type Box = { x: number; y: number; w: number; h: number };

/** Font files (public, OFL) shared by the editor's @font-face and the vector PDF export. */
export const ACTIVITY_FONTS: Record<FontKey, { css: string; label: string; files: Record<400 | 700, string> }> = {
  baloo: {
    css: "CKC Activity Baloo",
    label: "Baloo 2",
    files: { 400: "/fonts/activities/Baloo2-Regular.ttf", 700: "/fonts/activities/Baloo2-Bold.ttf" },
  },
  comic: {
    css: "CKC Activity Comic",
    label: "Comic Relief",
    files: { 400: "/fonts/activities/ComicRelief-Regular.ttf", 700: "/fonts/activities/ComicRelief-Bold.ttf" },
  },
};

export const FONT_FACE_CSS = (Object.keys(ACTIVITY_FONTS) as FontKey[])
  .flatMap((k) =>
    ([400, 700] as const).map(
      (w) =>
        `@font-face{font-family:"${ACTIVITY_FONTS[k].css}";font-weight:${w};font-style:normal;font-display:block;src:url("${ACTIVITY_FONTS[k].files[w]}") format("truetype")}`,
    ),
  )
  .join("");

const HEX = /^#[0-9a-f]{6}$/i;

export function isPaint(v: unknown): v is string {
  return v === "none" || (typeof v === "string" && HEX.test(v));
}

export function withVariant(doc: ActivityDoc, variant: ActivityVariant): ActivityDoc {
  return {
    ...doc,
    variant,
    elements: doc.elements.map((el) => (el.palette ? { ...el, fill: el.palette[variant] } : el)),
  };
}

export type Pt = [number, number];
export type Seg = { op: "m" | "l"; p: Pt } | { op: "c"; p: [number, number, number, number, number, number] } | { op: "h" };

/** Parses the absolute M / L / C / Z paths used by the model (and by shapes the editor adds). */
export function parsePath(d: string): Seg[] {
  const out: Seg[] = [];
  const re = /([MLCZmlcz])([^MLCZmlcz]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) {
    const op = m[1]!.toUpperCase();
    const nums = (m[2]!.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? []).map(Number);
    if (op === "Z") out.push({ op: "h" });
    else if (op === "M" || op === "L") {
      for (let i = 0; i + 1 < nums.length; i += 2) out.push({ op: i === 0 && op === "M" ? "m" : "l", p: [nums[i]!, nums[i + 1]!] });
    } else if (op === "C") {
      for (let i = 0; i + 5 < nums.length; i += 6) {
        out.push({ op: "c", p: [nums[i]!, nums[i + 1]!, nums[i + 2]!, nums[i + 3]!, nums[i + 4]!, nums[i + 5]!] });
      }
    }
  }
  return out;
}

const K = 0.5522847498;

/** Untransformed outline of any non-text element as M / L / C / Z segments. */
export function elementSegments(el: Exclude<ActivityEl, TextEl>): Seg[] {
  switch (el.kind) {
    case "path":
      return parsePath(el.d);
    case "line":
      return [
        { op: "m", p: [el.x1, el.y1] },
        { op: "l", p: [el.x2, el.y2] },
      ];
    case "circle": {
      const { cx, cy, r } = el;
      const k = r * K;
      return [
        { op: "m", p: [cx + r, cy] },
        { op: "c", p: [cx + r, cy + k, cx + k, cy + r, cx, cy + r] },
        { op: "c", p: [cx - k, cy + r, cx - r, cy + k, cx - r, cy] },
        { op: "c", p: [cx - r, cy - k, cx - k, cy - r, cx, cy - r] },
        { op: "c", p: [cx + k, cy - r, cx + r, cy - k, cx + r, cy] },
        { op: "h" },
      ];
    }
    case "rect": {
      const { x, y, w, h } = el;
      const r = Math.max(0, Math.min(el.rx, w / 2, h / 2));
      if (!r) {
        return [
          { op: "m", p: [x, y] },
          { op: "l", p: [x + w, y] },
          { op: "l", p: [x + w, y + h] },
          { op: "l", p: [x, y + h] },
          { op: "h" },
        ];
      }
      const k = r * K;
      return [
        { op: "m", p: [x + r, y] },
        { op: "l", p: [x + w - r, y] },
        { op: "c", p: [x + w - r + k, y, x + w, y + r - k, x + w, y + r] },
        { op: "l", p: [x + w, y + h - r] },
        { op: "c", p: [x + w, y + h - r + k, x + w - r + k, y + h, x + w - r, y + h] },
        { op: "l", p: [x + r, y + h] },
        { op: "c", p: [x + r - k, y + h, x, y + h - r + k, x, y + h - r] },
        { op: "l", p: [x, y + r] },
        { op: "c", p: [x, y + r - k, x + r - k, y, x + r, y] },
        { op: "h" },
      ];
    }
  }
}

export function scaleOf(el: ActivityEl): { sx: number; sy: number; tx: number; ty: number } {
  return { sx: el.sx ?? 1, sy: el.sy ?? 1, tx: el.tx ?? 0, ty: el.ty ?? 0 };
}

export function mapPoint(el: ActivityEl, x: number, y: number): Pt {
  const t = scaleOf(el);
  return [t.sx * x + t.tx, t.sy * y + t.ty];
}

export function transformedSegments(el: Exclude<ActivityEl, TextEl>): Seg[] {
  const t = scaleOf(el);
  const X = (v: number) => t.sx * v + t.tx;
  const Y = (v: number) => t.sy * v + t.ty;
  return elementSegments(el).map((s) =>
    s.op === "h"
      ? s
      : s.op === "c"
        ? { op: "c", p: [X(s.p[0]), Y(s.p[1]), X(s.p[2]), Y(s.p[3]), X(s.p[4]), Y(s.p[5])] }
        : { op: s.op, p: [X(s.p[0]), Y(s.p[1])] },
  );
}

/** Stroke width as painted (strokes scale with the element, like SVG without vector-effect). */
export function paintedStrokeWidth(el: ActivityEl): number {
  const t = scaleOf(el);
  return (el.strokeWidth ?? 1) * Math.sqrt(Math.abs(t.sx * t.sy));
}

/** Geometry bounds before the element's own move/resize (control-point hull for curves). */
export function rawBounds(el: Exclude<ActivityEl, TextEl>): Box {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const s of elementSegments(el)) {
    if (s.op === "h") continue;
    for (let i = 0; i < s.p.length; i += 2) {
      x0 = Math.min(x0, s.p[i]!);
      x1 = Math.max(x1, s.p[i]!);
      y0 = Math.min(y0, s.p[i + 1]!);
      y1 = Math.max(y1, s.p[i + 1]!);
    }
  }
  if (!Number.isFinite(x0)) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** Rough text box when the browser cannot measure (before fonts load, tests). */
export function estimateTextBounds(el: TextEl): Box {
  const w = el.text.length * el.fontSize * 0.5;
  const x = el.anchor === "middle" ? el.x - w / 2 : el.anchor === "end" ? el.x - w : el.x;
  return { x, y: el.y - el.fontSize * 0.8, w, h: el.fontSize };
}

export function applyBox(el: ActivityEl, raw: Box): Box {
  const t = scaleOf(el);
  const xa = t.sx * raw.x + t.tx;
  const xb = t.sx * (raw.x + raw.w) + t.tx;
  const ya = t.sy * raw.y + t.ty;
  const yb = t.sy * (raw.y + raw.h) + t.ty;
  return { x: Math.min(xa, xb), y: Math.min(ya, yb), w: Math.abs(xb - xa), h: Math.abs(yb - ya) };
}

export function unionBoxes(boxes: Box[]): Box | null {
  if (!boxes.length) return null;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const b of boxes) {
    x0 = Math.min(x0, b.x);
    y0 = Math.min(y0, b.y);
    x1 = Math.max(x1, b.x + b.w);
    y1 = Math.max(y1, b.y + b.h);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

export function boxesIntersect(a: Box, b: Box): boolean {
  return a.x <= b.x + b.w && b.x <= a.x + a.w && a.y <= b.y + b.h && b.y <= a.y + a.h;
}

/** Moves an element by (dx, dy) page points. */
export function moved(el: ActivityEl, dx: number, dy: number): ActivityEl {
  const t = scaleOf(el);
  return { ...el, tx: t.tx + dx, ty: t.ty + dy };
}

/**
 * Maps an element from box `from` to box `to` (both page space): a group resize.
 * Page point p -> to.x + (p - from.x) * kx.
 */
export function resized(el: ActivityEl, from: Box, to: Box): ActivityEl {
  const kx = from.w ? to.w / from.w : 1;
  const ky = from.h ? to.h / from.h : 1;
  const t = scaleOf(el);
  return {
    ...el,
    sx: t.sx * kx,
    sy: t.sy * ky,
    tx: to.x + (t.tx - from.x) * kx,
    ty: to.y + (t.ty - from.y) * ky,
  };
}

/** Bakes move/resize into a line's end points (used when dragging one end of a line). */
export function bakedLine(el: LineEl): LineEl {
  const [x1, y1] = mapPoint(el, el.x1, el.y1);
  const [x2, y2] = mapPoint(el, el.x2, el.y2);
  const out: LineEl = { ...el, x1, y1, x2, y2, strokeWidth: paintedStrokeWidth(el) };
  delete out.tx;
  delete out.ty;
  delete out.sx;
  delete out.sy;
  return out;
}

export function nextId(doc: ActivityDoc, prefix: string): string {
  let n = doc.elements.length + 1;
  const ids = new Set(doc.elements.map((e) => e.id));
  while (ids.has(`${prefix}${n}`)) n++;
  return `${prefix}${n}`;
}

const MAX_ELEMENTS = 5000;
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && Math.abs(v) < 1e5;
const optFinite = (v: unknown) => v === undefined || finite(v);
const str = (v: unknown, max: number): v is string => typeof v === "string" && v.length <= max;

/** Validates a document from storage or the network. Returns null when anything is off. */
export function parseActivityDoc(raw: unknown): ActivityDoc | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  if (d.version !== 1 || !str(d.slug, 80) || !str(d.title, 120) || !finite(d.width) || !finite(d.height)) return null;
  if (d.variant !== "bw" && d.variant !== "color") return null;
  if (!Array.isArray(d.elements) || d.elements.length > MAX_ELEMENTS) return null;
  const ids = new Set<string>();
  for (const item of d.elements as unknown[]) {
    if (!item || typeof item !== "object") return null;
    const e = item as Record<string, unknown>;
    if (!str(e.id, 40) || ids.has(e.id) || !str(e.name, 200) || !str(e.group, 200)) return null;
    ids.add(e.id);
    if (!isPaint(e.fill) || !isPaint(e.stroke)) return null;
    if (!optFinite(e.strokeWidth) || !optFinite(e.tx) || !optFinite(e.ty) || !optFinite(e.sx) || !optFinite(e.sy)) return null;
    if (e.lineCap !== undefined && !["butt", "round", "square"].includes(e.lineCap as string)) return null;
    if (e.lineJoin !== undefined && !["miter", "round", "bevel"].includes(e.lineJoin as string)) return null;
    if (e.palette !== undefined) {
      const p = e.palette as Record<string, unknown> | null;
      if (!p || !isPaint(p.bw) || !isPaint(p.color)) return null;
    }
    switch (e.kind) {
      case "path":
        if (!str(e.d, 20000) || !/^[MLCZmlcz0-9eE.,\s-]*$/.test(e.d)) return null;
        break;
      case "line":
        if (![e.x1, e.y1, e.x2, e.y2].every(finite)) return null;
        break;
      case "rect":
        if (![e.x, e.y, e.w, e.h, e.rx].every(finite)) return null;
        break;
      case "circle":
        if (![e.cx, e.cy, e.r].every(finite)) return null;
        break;
      case "text":
        if (![e.x, e.y, e.fontSize].every(finite) || !str(e.text, 500)) return null;
        if (e.fontFamily !== "baloo" && e.fontFamily !== "comic") return null;
        if (e.fontWeight !== 400 && e.fontWeight !== 700) return null;
        if (!["start", "middle", "end"].includes(e.anchor as string)) return null;
        break;
      default:
        return null;
    }
  }
  return raw as ActivityDoc;
}
