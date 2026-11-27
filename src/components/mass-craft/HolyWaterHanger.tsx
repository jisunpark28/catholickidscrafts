/**
 * Cut-out door hanger. Coordinates are CSS pixels at 96px per inch, so an inch in
 * the SVG is an inch on the letter page when the SVG is not scaled.
 *
 * Doorknob hole: 2.375 in = 60.3 mm, inside 2.25–2.5 in (57–64 mm).
 * Paper left around the hole: 0.85 in above, 0.75 in on each side.
 */
export const DOORKNOB_HOLE_IN = 2.375;
export const DOORKNOB_HOLE_MM = 60.3;
const PX_PER_IN = 96;
const HOLE_D = DOORKNOB_HOLE_IN * PX_PER_IN;
const HOLE_R = HOLE_D / 2;
const SIDE_IN = 0.75;
const TOP_IN = 0.85;
const HANGER_W = HOLE_D + SIDE_IN * PX_PER_IN * 2;
const BELOW_HOLE = 2.5 * PX_PER_IN;
const HANGER_H = TOP_IN * PX_PER_IN + HOLE_D + BELOW_HOLE;

const COPY = {
  1: {
    steps: "Color the cross and the drop. Cut on the dashed line. Open the slit and hang it on a doorknob.",
    line: "I remember my baptism.",
  },
  2: {
    steps:
      "When we come into church, we touch the holy water. Then we make the Sign of the Cross and remember our baptism. Holy water is not Baptism.",
    line: "One way I will remember baptism:",
  },
} as const;

export function HolyWaterHanger({ level }: { level: 1 | 2 }) {
  const copy = COPY[level];
  const cx = HANGER_W / 2;
  const topPaper = TOP_IN * PX_PER_IN;
  const cy = topPaper + HOLE_R;
  const slit = 0.28 * PX_PER_IN;
  const meet = cy - Math.sqrt(HOLE_R * HOLE_R - slit * slit);

  return (
    <article className="hw-page" data-hole-in={DOORKNOB_HOLE_IN} data-hole-mm={DOORKNOB_HOLE_MM}>
      <style>{HANGER_CSS}</style>
      <header className="hw-margin">
        <p className="hw-title">Holy Water Blessing Hanger</p>
        <p className="hw-level">Level {level}</p>
        <p className="hw-steps">{copy.steps}</p>
        <p className="hw-name">
          Name: <span className="hw-name-line" />
        </p>
        <p className="hw-prompt">{copy.line}</p>
        <div className="hw-write" />
        <p className="hw-cut">
          <Scissors /> Cut
        </p>
      </header>
      <svg
        className="hw-hanger"
        width={`${HANGER_W / PX_PER_IN}in`}
        height={`${HANGER_H / PX_PER_IN}in`}
        viewBox={`0 0 ${HANGER_W} ${HANGER_H}`}
        role="img"
        aria-label="Door hanger to cut out"
      >
        <rect x="1" y="1" width={HANGER_W - 2} height={HANGER_H - 2} rx="28" fill="#fff" stroke="#111" strokeWidth="2" strokeDasharray="7 5" />
        <line x1={cx - slit} y1="0" x2={cx - slit} y2={meet} stroke="#111" strokeWidth="2" strokeDasharray="7 5" />
        <line x1={cx + slit} y1="0" x2={cx + slit} y2={meet} stroke="#111" strokeWidth="2" strokeDasharray="7 5" />
        <circle cx={cx} cy={cy} r={HOLE_R} fill="#fff" stroke="#111" strokeWidth="2" strokeDasharray="7 5" />
        <path d={`M ${cx} ${cy + HOLE_R + 36} v 78 M ${cx - 28} ${cy + HOLE_R + 62} h 56`} fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />
        <path
          d={`M ${cx} ${cy + HOLE_R + 150} c -28 0 -40 22 -40 40 c 0 36 40 62 40 62 c 0 0 40 -26 40 -62 c 0 -18 -12 -40 -40 -40 z`}
          fill="none"
          stroke="#111"
          strokeWidth="2.5"
        />
        <text x={cx} y={HANGER_H - 28} textAnchor="middle" fontSize="18" fontFamily="Georgia, serif">
          Holy Water
        </text>
      </svg>
      <footer className="hw-foot">catholickidscrafts.com</footer>
    </article>
  );
}

function Scissors() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
      <circle cx="8" cy="24" r="4" fill="none" stroke="#111" strokeWidth="1.6" />
      <circle cx="24" cy="24" r="4" fill="none" stroke="#111" strokeWidth="1.6" />
      <path d="M10 21 L22 6 M22 21 L10 6" fill="none" stroke="#111" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const HANGER_CSS = `
.hw-page{width:8.5in;height:10.2in;margin:0 auto;background:#fff;color:#111;font-family:Georgia,"Times New Roman",serif;display:flex;flex-direction:column;align-items:center;box-sizing:border-box;padding:0.35in 0.45in 0.25in}
.hw-margin{width:100%;max-width:7.4in}
.hw-title{margin:0;font-size:22px;line-height:1.2}
.hw-level{margin:4px 0 0;font-size:14px}
.hw-steps{margin:8px 0 0;font-size:16px;line-height:1.45}
.hw-name{margin:10px 0 0;font-size:16px;display:flex;align-items:flex-end;gap:8px}
.hw-name-line{display:inline-block;width:2.4in;border-bottom:1px solid #888;height:32px}
.hw-prompt{margin:8px 0 0;font-size:16px;line-height:1.4}
.hw-write{height:32px;border-bottom:1px solid #888;margin-top:4px}
.hw-cut{margin:10px 0 6px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:14px}
.hw-hanger{display:block}
.hw-foot{margin-top:auto;font-size:12px;color:#444}
@media print{
  .hw-page{width:auto;height:auto;max-height:100%;margin:0;box-shadow:none}
}
`;
