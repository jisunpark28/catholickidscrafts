import { generateMaze } from "@/lib/sheet-activities/generate";
import type { ActivityOf } from "@/lib/sheet-activities/schema";
import { wrapLabel } from "./Heart";

export function MazeActivity({ data, level, seed }: { data: ActivityOf<"maze">; level: 1 | 2; seed: string }) {
  const [cols, rows] = level === 1 ? [6, 4] : [11, 7];
  const m = generateMaze(cols, rows, seed);
  const x0 = 110;
  const y0 = 20;
  const w = 380;
  const h = 300;
  const cw = w / cols;
  const ch = h / rows;
  const walls: string[] = [`M${x0} ${y0}H${x0 + w}`, `M${x0} ${y0 + ch}V${y0 + h}`, `M${x0} ${y0 + h}H${x0 + w}`, `M${x0 + w} ${y0}V${y0 + h - ch}`];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * cw;
      const y = y0 + r * ch;
      if (c < cols - 1 && m.right[r][c]) walls.push(`M${x + cw} ${y}V${y + ch}`);
      if (r < rows - 1 && m.down[r][c]) walls.push(`M${x} ${y + ch}H${x + cw}`);
    }
  const lbl = (text: string, x: number, y: number) => (
    <text x={x} y={y} textAnchor="middle" fontSize="16">
      {wrapLabel(text, 11).map((l, i) => (
        <tspan key={i} x={x} dy={i ? 18 : 0}>
          {l}
        </tspan>
      ))}
    </text>
  );
  return (
    <svg viewBox="0 0 600 340" style={{ flex: 1, minHeight: 0, width: "100%" }} aria-hidden="true">
      <path className="ln" d={walls.join(" ")} style={{ strokeWidth: level === 1 ? 5 : 3.5 }} />
      {lbl(data.start, 55, y0 + ch / 2 - 4)}
      <path className="ln" d={`M70 ${y0 + ch / 2 + 22}h30m-8 -6l8 6-8 6`} style={{ strokeWidth: 3 }} />
      {lbl(data.goal, 545, y0 + h - ch / 2 - 4)}
      <path className="ln" d={`M${x0 + w + 6} ${y0 + h - ch / 2 + 22}h30m-8 -6l8 6-8 6`} style={{ strokeWidth: 3 }} />
    </svg>
  );
}
