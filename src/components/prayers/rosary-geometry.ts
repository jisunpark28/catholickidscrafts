/** Circular rosary layout (px). Ported from the approved mockup; s scales everything uniformly. */

export type RosaryPointType = "bead" | "rosemark" | "big" | "medal" | "cross";
export type RosaryPoint = { key: string; type: RosaryPointType; w?: number; x: number; y: number };
type Cfg = Record<string, number>;
export type RosaryGeom = {
  w: number; h: number; cx: number; cy: number; R: number; c: Cfg;
  pts: RosaryPoint[]; cross: RosaryPoint; spark: { x: number; y: number; sc: number; o: number }[]; full: boolean;
};
export type Viewport = "mobile" | "tablet" | "desktop";

function baseCfg(full: boolean, vp: Viewport): Cfg {
  if (vp === "desktop") return full
    ? { R: 330, bead: 27, rose: 34, big: 40, cpW: 50, cpH: 64, crossW: 54, crossH: 80, step: 40, pad: 28, cordW: 6, haloW: 12 }
    : { R: 330, bead: 56, rose: 66, big: 66, medW: 60, medH: 78, crossW: 64, crossH: 96, pad: 44, cordW: 7, haloW: 13 };
  const m = vp === "mobile";
  if (!full) return m
    ? { R: 134, bead: 26, rose: 32, big: 33, medW: 30, medH: 39, crossW: 34, crossH: 50, pad: 22, cordW: 5, haloW: 9 }
    : { R: 168, bead: 32, rose: 40, big: 41, medW: 36, medH: 47, crossW: 40, crossH: 60, pad: 28, cordW: 5, haloW: 9 };
  return m
    ? { R: 150, bead: 14, rose: 18, big: 21, cpW: 26, cpH: 33, crossW: 30, crossH: 44, step: 20, pad: 14, cordW: 3.5, haloW: 7 }
    : { R: 172, bead: 16, rose: 20, big: 24, cpW: 30, cpH: 38, crossW: 34, crossH: 50, step: 23, pad: 16, cordW: 4, haloW: 8 };
}
function scaleCfg(c: Cfg, s: number): Cfg {
  const o: Cfg = {};
  for (const k in c) o[k] = k === "cordW" || k === "haloW" ? c[k] * Math.max(0.8, s) : c[k] * s;
  return o;
}

/** Ring items in prayer order: from the bottom, up the right side, over the top, down the left. */
function ringItems(full: boolean): { key: string; type: RosaryPointType; w: number }[] {
  const it: { key: string; type: RosaryPointType; w: number }[] = [];
  if (!full) {
    // 1-decade rosary: cross, rose, 3 beads, rose, 10 beads (one closed circle)
    it.push({ key: "cross", type: "cross", w: 1.75 });
    it.push({ key: "of", type: "rosemark", w: 1.45 });
    for (let b = 0; b < 3; b++) it.push({ key: "i" + b, type: "bead", w: 1 });
    it.push({ key: "medal", type: "rosemark", w: 1.45 });
    for (let b = 0; b < 10; b++) it.push({ key: "h" + b, type: "bead", w: 1 });
  } else {
    // 5-decade loop: centerpiece, D1(10), big, D2, big, D3, big, D4, big, D5, back to centerpiece
    it.push({ key: "center", type: "medal", w: 2.4 });
    for (let d = 0; d < 5; d++) {
      for (let b = 0; b < 10; b++) it.push({ key: "d" + d + "h" + b, type: "bead", w: 1 });
      if (d < 4) it.push({ key: "b" + d, type: "big", w: 1.75 });
    }
  }
  return it;
}

export function rosaryGeom(full: boolean, s: number, vp: Viewport): RosaryGeom {
  const c = scaleCfg(baseCfg(full, vp), s);
  const R = c.R, cx = c.pad + R, cy = c.pad + R, w = 2 * (c.pad + R);
  const at = (a: number) => ({ x: cx + R * Math.sin(a), y: cy + R * Math.cos(a) });
  const items = ringItems(full);
  const tot = items.reduce((a, b) => a + b.w, 0);
  let acc = 0;
  const pts: RosaryPoint[] = [];
  items.forEach((it, i) => {
    const center = i === 0 ? 0 : acc + it.w / 2;
    if (i === 0) acc = it.w / 2; else acc += it.w;
    pts.push({ ...it, ...at((2 * Math.PI * center) / tot) });
  });
  let h: number, cross: RosaryPoint;
  if (!full) {
    cross = pts[0];
    cross.y += c.crossH * 0.2; // hangs a little below the cord
    h = cross.y + c.crossH / 2 + 6;
  } else {
    const cp = pts[0];
    let y = cp.y + c.cpH / 2 + c.step * 0.85;
    pts.push({ key: "pB", type: "big", x: cx, y }); y += c.step * 0.95;
    const hm: number[] = [];
    for (let k = 0; k < 3; k++) { hm.push(y); y += c.step * 0.8; }
    y += c.step * 0.15;
    // bottom-up order: p0 is the lowest Hail Mary
    pts.push({ key: "p2", type: "bead", x: cx, y: hm[0] }, { key: "p1", type: "bead", x: cx, y: hm[1] }, { key: "p0", type: "bead", x: cx, y: hm[2] });
    pts.push({ key: "pOF", type: "big", x: cx, y });
    y += c.big / 2 + 3 + c.crossH / 2;
    cross = { key: "cross", type: "cross", x: cx, y };
    pts.push(cross);
    h = y + c.crossH / 2 + 4;
  }
  const spark = [
    { x: cx - R * 0.4, y: cy - R * 0.78, sc: 0.9, o: 0.85 }, { x: cx + R * 0.58, y: cy - R * 0.66, sc: 0.72, o: 0.75 },
    { x: cx - R * 0.74, y: cy + R * 0.06, sc: 0.6, o: 0.65 }, { x: cx + R * 0.76, y: cy + R * 0.14, sc: 0.7, o: 0.7 },
    { x: cx - R * 0.48, y: cy + R * 0.6, sc: 0.5, o: 0.5 }, { x: cx + R * 0.46, y: cy + R * 0.58, sc: 0.46, o: 0.5 },
  ].map((p) => ({ ...p, sc: p.sc * Math.min(1, s * (full ? 0.85 : 1)) }));
  return { w, h, cx, cy, R, c, pts, cross, spark, full };
}
