import type { SheetLevelNumber } from "@/lib/gospel-sheet-level";

const HEART =
  "M300 385 C 70 250 15 160 55 90 C 100 15 235 15 300 105 C 365 15 500 15 545 90 C 585 160 530 250 300 385 Z";

function Decorations() {
  return (
    <g className="ln" style={{ strokeWidth: 3 }}>
      <path d="M300 8v34 M286 20h28" />
      <path d="M40 330c-6-11-23-5-15 8l15 13 15-13c8-13-9-19-15-8z" />
      <path d="M560 330c-6-11-23-5-15 8l15 13 15-13c8-13-9-19-15-8z" />
      <path d="M45 30l5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2z" />
      <path d="M555 30l5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2z" />
      <path d="M120 365l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" />
      <path d="M480 365l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" />
    </g>
  );
}

function fit(label: string, base: number): number {
  if (label.length > 30) return base - 6;
  if (label.length > 22) return base - 2;
  return base;
}

/** Greedy word wrap for SVG labels (SVG text does not wrap by itself). */
export function wrapLabel(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (cur && (cur + " " + word).length > maxChars) {
      lines.push(cur);
      cur = word;
    } else cur = cur ? `${cur} ${word}` : word;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function HeartTopBottom({ a, b, clipId }: { a: string; b: string; clipId: string }) {
  return (
    <svg viewBox="0 0 600 400" style={{ flex: 1, minHeight: 0 }} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d={HEART} />
        </clipPath>
      </defs>
      <Decorations />
      <path className="ln" d={HEART} style={{ strokeWidth: 7 }} />
      <path
        className="ln"
        d="M0 200 q150 -14 300 0 t300 0"
        clipPath={`url(#${clipId})`}
        style={{ strokeWidth: 3, strokeDasharray: "10 8" }}
      />
      <text x="300" y="150" textAnchor="middle" fontSize={fit(a, 26)}>
        {a}
      </text>
      <text x="300" y="245" textAnchor="middle" fontSize={fit(b, 22)}>
        {b}
      </text>
    </svg>
  );
}

/** Level 2: each half's label wraps (max ~13 chars/line) instead of running past the centre line. */
function HeartLeftRight({ a, b, clipId }: { a: string; b: string; clipId: string }) {
  const la = wrapLabel(a, 13);
  const lb = wrapLabel(b, 13);
  const extra = Math.max(la.length, lb.length) - 1;
  const top = 92 - extra * 10;
  const rows = [
    { n: "1.", y: 170 + extra * 14, lx: 95 },
    { n: "2.", y: 225 + extra * 10, lx: 120 },
    { n: "3.", y: 280 + extra * 6, lx: 160 },
  ];
  const label = (lines: string[], x: number) => (
    <text x={x} y={top} textAnchor="middle" fontSize={lines.length > 1 ? 19 : 22}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 21}>
          {l}
        </tspan>
      ))}
    </text>
  );
  const subY = top + 24 + extra * 21;
  return (
    <svg viewBox="0 0 600 400" style={{ flex: 1, minHeight: 0 }} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d={HEART} />
        </clipPath>
      </defs>
      <Decorations />
      <path className="ln" d={HEART} style={{ strokeWidth: 7 }} />
      <path className="ln" d="M300 105V385" style={{ strokeWidth: 3 }} />
      {label(la, 190)}
      <text x="190" y={subY} textAnchor="middle" fontSize="13">
        3 ways I can…
      </text>
      {label(lb, 410)}
      <text x="410" y={subY} textAnchor="middle" fontSize="13">
        3 ways I can…
      </text>
      {rows.map((r) => (
        <g key={r.n}>
          <text x={r.lx} y={r.y - 6} fontSize="18">
            {r.n}
          </text>
          <path
            className="ln"
            d={`M60 ${r.y}H290`}
            clipPath={`url(#${clipId})`}
            style={{ strokeWidth: 2, strokeDasharray: "3 6" }}
          />
          <text x="312" y={r.y - 6} fontSize="18">
            {r.n}
          </text>
          <path
            className="ln"
            d={`M310 ${r.y}H540`}
            clipPath={`url(#${clipId})`}
            style={{ strokeWidth: 2, strokeDasharray: "3 6" }}
          />
        </g>
      ))}
    </svg>
  );
}

export function HeartActivity({
  a,
  b,
  level,
  clipId,
}: {
  a: string;
  b: string;
  level: SheetLevelNumber;
  clipId: string;
}) {
  return level === 1 ? (
    <HeartTopBottom a={a} b={b} clipId={clipId} />
  ) : (
    <HeartLeftRight a={a} b={b} clipId={clipId} />
  );
}
