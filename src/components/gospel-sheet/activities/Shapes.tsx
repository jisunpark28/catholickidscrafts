import type { ActivityOf } from "@/lib/sheet-activities/schema";
import { SHAPE_POINTS, samplePerimeter, toPath } from "@/lib/sheet-activities/shapes";

/** Scale + offset that centre a 0..100 polygon inside a w x h box with `pad` margin. */
function fitBox(points: ReadonlyArray<readonly [number, number]>, w: number, h: number, pad: number) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const s = Math.min((w - 2 * pad) / (maxX - minX), (h - 2 * pad) / (maxY - minY));
  return { s, minX, maxX, minY, maxY, ox: (w - (maxX - minX) * s) / 2 - minX * s, oy: (h - (maxY - minY) * s) / 2 - minY * s };
}

export function ShapeCraftActivity({ data, level }: { data: ActivityOf<"shapecraft">; level: 1 | 2 }) {
  const pts = SHAPE_POINTS[data.shape];
  const f = fitBox(pts, 600, 268, 6);
  const midY = f.oy + ((f.minY + f.maxY) / 2) * f.s;
  return (
    <svg viewBox="0 0 600 330" style={{ flex: 1, minHeight: 0 }} aria-hidden="true">
      <path className="ln" d={toPath(pts, f.s, f.ox, f.oy)} style={{ strokeWidth: 4, strokeDasharray: "12 8" }} />
      <text x={f.ox + f.maxX * f.s + 14} y="34" fontSize="26">
        ✂
      </text>
      <text x="300" y={level === 1 ? 312 : 314} textAnchor="middle" fontSize={level === 1 ? 22 : 16}>
        {level === 1 ? data.label : `${data.label}: write your promise inside, then cut it out`}
      </text>
      {level === 2 ? (
        <g className="ln" style={{ strokeWidth: 2, strokeDasharray: "3 6" }}>
          <path d={`M245 ${midY - 12}H355`} />
          <path d={`M245 ${midY + 20}H355`} />
        </g>
      ) : null}
    </svg>
  );
}

export function DotToDotActivity({ data, level }: { data: ActivityOf<"dottodot">; level: 1 | 2 }) {
  const n = level === 1 ? 12 : 24;
  const pts = samplePerimeter(SHAPE_POINTS[data.shape], n);
  const { s, ox, oy } = fitBox(SHAPE_POINTS[data.shape], 600, 330, 34);
  const cx = pts.reduce((a, p) => a + p[0], 0) / n;
  const cy = pts.reduce((a, p) => a + p[1], 0) / n;
  return (
    <svg viewBox="0 0 600 330" style={{ flex: 1, minHeight: 0 }} aria-hidden="true">
      {pts.map(([x, y], i) => {
        const dx = x - cx;
        const dy = y - cy;
        const d = Math.hypot(dx, dy) || 1;
        return (
          <g key={i}>
            <circle cx={ox + x * s} cy={oy + y * s} r={level === 1 ? 5 : 4} fill="#111" />
            <text x={ox + x * s + (dx / d) * 16} y={oy + y * s + (dy / d) * 16 + 5} textAnchor="middle" fontSize={level === 1 ? 16 : 12}>
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
