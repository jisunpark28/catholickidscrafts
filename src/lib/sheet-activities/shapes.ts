import type { ShapeName } from "./schema";

type Pt = [number, number];

function arc(cx: number, cy: number, r: number, from: number, to: number, n: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

function star(): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 48 : 20;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    out.push([50 + r * Math.cos(a), 52 + r * Math.sin(a)]);
  }
  return out;
}

function heart(): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < 24; i++) {
    const t = (i / 24) * 2 * Math.PI;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    out.push([50 + x * 2.8, 45 - y * 2.8]);
  }
  return out;
}

/** Closed outlines in a 0..100 box (clockwise). Used by shape craft and dot-to-dot. */
export const SHAPE_POINTS: Record<ShapeName, Pt[]> = {
  crown: [[8, 85], [8, 30], [29, 55], [50, 15], [71, 55], [92, 30], [92, 85]],
  lamp: [[8, 62], [28, 50], [50, 47], [70, 50], [86, 40], [96, 43], [86, 58], [74, 70], [50, 76], [26, 72]],
  star: star(),
  fish: [[6, 50], [22, 30], [45, 22], [68, 30], [82, 44], [96, 22], [94, 78], [82, 56], [68, 70], [45, 78], [22, 70]],
  boat: [[4, 62], [46, 62], [46, 8], [82, 56], [52, 56], [52, 62], [96, 62], [80, 88], [20, 88]],
  candle: [[36, 96], [36, 42], [46, 42], [42, 30], [50, 6], [58, 30], [54, 42], [64, 42], [64, 96]],
  door: [[22, 96], [22, 42], ...arc(50, 42, 28, Math.PI, 2 * Math.PI, 8).slice(1, -1), [78, 42], [78, 96]],
  cross: [[42, 4], [58, 4], [58, 28], [82, 28], [82, 44], [58, 44], [58, 96], [42, 96], [42, 44], [18, 44], [18, 28], [42, 28]],
  house: [[14, 96], [14, 46], [50, 10], [86, 46], [86, 96]],
  heart: heart(),
};

/** Points spaced evenly along the closed outline. */
export function samplePerimeter(points: Pt[], n: number): Pt[] {
  const segs = points.map((p, i) => [p, points[(i + 1) % points.length]] as const);
  const lens = segs.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
  const total = lens.reduce((x, y) => x + y, 0);
  const out: Pt[] = [];
  let seg = 0;
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const d = (total * i) / n;
    while (acc + lens[seg] < d) acc += lens[seg++];
    const t = lens[seg] ? (d - acc) / lens[seg] : 0;
    const [a, b] = segs[seg];
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

export function toPath(points: Pt[], scale: number, ox: number, oy: number): string {
  return `${points.map(([x, y], i) => `${i ? "L" : "M"}${(ox + x * scale).toFixed(1)} ${(oy + y * scale).toFixed(1)}`).join(" ")} Z`;
}

/** Even-odd point-in-polygon test (0..100 box). */
export function insidePolygon(points: Pt[], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
