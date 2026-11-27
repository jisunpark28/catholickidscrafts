import { MassTraceGuide } from "@/components/gospel-sheet/MassTraceGuide";

/**
 * Cut-out door hanger. SVG width and height are set in inches, so the drawing
 * is not scaled and the hole stays 2.375 in (60.3 mm) on a letter page.
 * Paper left around the hole: 0.85 in above, 0.75 in on each side.
 * Hanger size: 3.875 in wide. Height is as tall as one letter page allows
 * once the name line, instructions, and writing lines sit outside the cut.
 */
export const DOORKNOB_HOLE_IN = 2.375;
export const DOORKNOB_HOLE_MM = 60.3;
const PX_PER_IN = 96;
const HOLE_D = DOORKNOB_HOLE_IN * PX_PER_IN;
const HOLE_R = HOLE_D / 2;
const SIDE_IN = 0.75;
const TOP_IN = 0.85;
const HANGER_W = HOLE_D + SIDE_IN * PX_PER_IN * 2;
const HANGER_H = 6.85 * PX_PER_IN;

const COPY = {
  1: {
    steps: "Color the cross and the drop. Cut on the dashed line. Open the slit and hang it on a doorknob.",
    line: "I remember my baptism.",
  },
  2: {
    steps:
      "When we come into church, we touch the holy water. Then we make the Sign of the Cross and remember our baptism.",
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
  const holeBottom = cy + HOLE_R;
  const cross = { top: holeBottom + 22, w: 112, h: 132, thick: 26, barAt: 34 };
  const drop = { top: cross.top + cross.h + 22, w: 76, h: 96 };
  const labelY = drop.top + drop.h + 26;

  return (
    <article className="hw-page" data-hole-in={DOORKNOB_HOLE_IN} data-hole-mm={DOORKNOB_HOLE_MM}>
      <style>{HANGER_CSS}</style>
      <header className="hw-head">
        <p className="hw-title">Holy Water Blessing Hanger</p>
        <div className="hw-meta">
          <span>Level {level}</span>
          <span className="hw-name">
            Name: <span className="hw-name-line" />
          </span>
        </div>
      </header>
      <p className="hw-steps">{copy.steps}</p>
      <p className="hw-prompt">{copy.line}</p>
      {level === 1 ? (
        <div className="hw-trace">
          <MassTraceGuide text={copy.line} maxWidth={680} />
        </div>
      ) : (
        <>
          <div className="hw-wl" />
          <div className="hw-wl" />
        </>
      )}
      <p className="hw-cut">
        <Scissors /> Cut
      </p>
      <svg
        className="hw-hanger"
        width={`${HANGER_W / PX_PER_IN}in`}
        height={`${HANGER_H / PX_PER_IN}in`}
        viewBox={`0 0 ${HANGER_W} ${HANGER_H}`}
        role="img"
        aria-label="Door hanger to cut out"
      >
        <rect
          x="1.5"
          y="1.5"
          width={HANGER_W - 3}
          height={HANGER_H - 3}
          rx="28"
          fill="#fff"
          stroke="#111"
          strokeWidth="2"
          strokeDasharray="7 5"
        />
        <line x1={cx - slit} y1="1.5" x2={cx - slit} y2={meet} stroke="#111" strokeWidth="2" strokeDasharray="7 5" />
        <line x1={cx + slit} y1="1.5" x2={cx + slit} y2={meet} stroke="#111" strokeWidth="2" strokeDasharray="7 5" />
        <circle cx={cx} cy={cy} r={HOLE_R} fill="#fff" stroke="#111" strokeWidth="2" strokeDasharray="7 5" />
        <path d={crossPath(cx, cross.top, cross.w, cross.h, cross.thick, cross.barAt)} fill="#fff" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={dropPath(cx, drop.top, drop.w, drop.h)} fill="#fff" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
        <text x={cx} y={labelY} textAnchor="middle" fontSize="20" fontWeight="700">
          Holy Water
        </text>
      </svg>
      <footer className="hw-foot">catholickidscrafts.com</footer>
    </article>
  );
}

function crossPath(cx: number, top: number, w: number, h: number, thick: number, barAt: number) {
  const left = cx - w / 2;
  const right = cx + w / 2;
  const stemL = cx - thick / 2;
  const stemR = cx + thick / 2;
  const barTop = top + barAt;
  const barBot = barTop + thick;
  const bot = top + h;
  return [
    `M ${stemL} ${top}`,
    `H ${stemR}`,
    `V ${barTop}`,
    `H ${right}`,
    `V ${barBot}`,
    `H ${stemR}`,
    `V ${bot}`,
    `H ${stemL}`,
    `V ${barBot}`,
    `H ${left}`,
    `V ${barTop}`,
    `H ${stemL}`,
    `Z`,
  ].join(" ");
}

function dropPath(cx: number, top: number, w: number, h: number) {
  const hw = w / 2;
  const bottom = top + h;
  const bulge = top + h * 0.62;
  return `M ${cx} ${top}
    C ${cx + hw * 0.12} ${top + h * 0.36}, ${cx + hw} ${top + h * 0.4}, ${cx + hw} ${bulge}
    C ${cx + hw} ${top + h * 0.88}, ${cx + hw * 0.58} ${bottom}, ${cx} ${bottom}
    C ${cx - hw * 0.58} ${bottom}, ${cx - hw} ${top + h * 0.88}, ${cx - hw} ${bulge}
    C ${cx - hw} ${top + h * 0.4}, ${cx - hw * 0.12} ${top + h * 0.36}, ${cx} ${top}
    Z`;
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
.hw-page{width:8.5in;margin:0 auto;background:#fff;color:#111;font-family:"Comic Sans MS","Chalkboard SE","Trebuchet MS",sans-serif;display:flex;flex-direction:column;align-items:center;box-sizing:border-box;padding:0.22in 0.42in 0.14in}
.hw-head{width:100%;border-bottom:1px solid #888;padding-bottom:4px;text-align:center}
.hw-title{margin:0;font-size:26px;font-weight:700;line-height:1.15}
.hw-meta{margin-top:2px;display:flex;justify-content:space-between;align-items:flex-end;font-size:14px;font-weight:700}
.hw-name{display:inline-flex;align-items:flex-end;gap:6px}
.hw-name-line{display:inline-block;width:9rem;height:32px;border-bottom:1px solid #888}
.hw-steps{width:100%;margin:8px 0 0;border:1px solid #888;border-radius:12px;padding:8px 12px;font-size:15px;line-height:1.4;text-align:center;box-sizing:border-box}
.hw-prompt{width:100%;margin:8px 0 0;font-size:16px;font-weight:700;line-height:1.3}
.hw-wl{width:100%;height:32px;border-bottom:1px solid #888;box-sizing:border-box}
.hw-trace{width:100%;margin:2px 0 4px}
.hw-trace text{fill:none;stroke:#888;stroke-width:1.25px;font-family:"Comic Sans MS","Chalkboard SE","Trebuchet MS",sans-serif}
.hw-cut{margin:6px 0 2px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:14px;font-weight:700}
.hw-hanger{display:block}
.hw-hanger text{font-family:"Comic Sans MS","Chalkboard SE","Trebuchet MS",sans-serif;fill:#111}
.hw-foot{width:100%;margin-top:6px;border-top:1px solid #888;padding-top:3px;text-align:center;font-size:12px;color:#444}
@media print{
  .hw-page{width:auto;margin:0}
}
`;
