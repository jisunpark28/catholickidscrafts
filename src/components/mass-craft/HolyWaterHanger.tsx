import { MassTraceGuide } from "@/components/gospel-sheet/MassTraceGuide";

/**
 * Door hanger. SVG inches are not scaled.
 * Hole: 2.2 in = 55.9 mm (within 2.0–2.25 in).
 * Width 4.5 in, so about 1.15 in of paper stays on each side of the hole.
 * The top edge is closed. One dashed slit runs from the right edge into the hole at 3 o'clock.
 */
export const DOORKNOB_HOLE_IN = 2.2;
export const DOORKNOB_HOLE_MM = 55.9;
const PX = 96;
const HOLE_D = DOORKNOB_HOLE_IN * PX;
const HOLE_R = HOLE_D / 2;
const HANGER_W = 4.5 * PX;
const TOP_PAPER = 0.72 * PX;
const CX = HANGER_W / 2;
const CY = TOP_PAPER + HOLE_R;
const TOP_SVG_H = CY + HOLE_R + 6;

const STEPS = "Color the cross and the drop. Cut on the dashed line, cut the side slit, and hang it on a doorknob.";

export function HolyWaterHanger({ level, ink = "line" }: { level: 1 | 2; ink?: "line" | "color" }) {
  const colored = ink === "color";
  const crossFill = colored ? "#e6c15a" : "#fff";
  const dropFill = colored ? "#7eb6d6" : "#fff";
  const crossStroke = colored ? "#5c4a22" : "#111";
  const dropStroke = colored ? "#2f6f99" : "#111";

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
      <p className="hw-steps">{STEPS}</p>
      <div className="hw-cut">
        <svg
          className="hw-top"
          width={`${HANGER_W / PX}in`}
          height={`${TOP_SVG_H / PX}in`}
          viewBox={`0 0 ${HANGER_W} ${TOP_SVG_H}`}
          role="img"
          aria-label="Doorknob hole with one side slit"
        >
          <circle cx={CX} cy={CY} r={HOLE_R} fill="#fff" stroke="#111" strokeWidth="2" strokeDasharray="7 5" />
          <line
            x1={HANGER_W}
            y1={CY}
            x2={CX + HOLE_R}
            y2={CY}
            stroke="#111"
            strokeWidth="2"
            strokeDasharray="7 5"
          />
        </svg>
        <p className="hw-cutmark" aria-hidden>
          <Scissors /> Cut
        </p>
        <svg className="hw-art" width={`${HANGER_W / PX}in`} height="2.35in" viewBox={`0 0 ${HANGER_W} 226`} aria-hidden>
          <path d={crossPath(CX, 8, 112, 120, 26, 30)} fill={crossFill} stroke={crossStroke} strokeWidth="2.5" strokeLinejoin="round" />
          <path d={dropPath(CX, 140, 72, 78)} fill={dropFill} stroke={dropStroke} strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
        <div className="hw-act">
          {level === 1 ? (
            <>
              <MassTraceGuide text="I remember" maxWidth={340} />
              <MassTraceGuide text="my baptism." maxWidth={340} />
            </>
          ) : (
            <>
              <p className="hw-act-line">1. Touch the holy water. 2. Make the Sign of the Cross.</p>
              <p className="hw-prompt">One way I will remember my baptism:</p>
              <div className="hw-wl" />
              <div className="hw-wl" />
            </>
          )}
        </div>
        <p className="hw-label">Holy Water</p>
      </div>
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
  return `M ${stemL} ${top} H ${stemR} V ${barTop} H ${right} V ${barBot} H ${stemR} V ${bot} H ${stemL} V ${barBot} H ${left} V ${barTop} H ${stemL} Z`;
}

function dropPath(cx: number, top: number, w: number, h: number) {
  const hw = w / 2;
  const bottom = top + h;
  const bulge = top + h * 0.62;
  return `M ${cx} ${top}
    C ${cx + hw * 0.12} ${top + h * 0.36}, ${cx + hw} ${top + h * 0.4}, ${cx + hw} ${bulge}
    C ${cx + hw} ${top + h * 0.88}, ${cx + hw * 0.58} ${bottom}, ${cx} ${bottom}
    C ${cx - hw * 0.58} ${bottom}, ${cx - hw} ${top + h * 0.88}, ${cx - hw} ${bulge}
    C ${cx - hw} ${top + h * 0.4}, ${cx - hw * 0.12} ${top + h * 0.36}, ${cx} ${top} Z`;
}

function Scissors() {
  return (
    <svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true">
      <circle cx="8" cy="24" r="4" fill="none" stroke="#111" strokeWidth="1.6" />
      <circle cx="24" cy="24" r="4" fill="none" stroke="#111" strokeWidth="1.6" />
      <path d="M10 21 L22 6 M22 21 L10 6" fill="none" stroke="#111" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const HANGER_CSS = `
.hw-page{width:8.5in;margin:0 auto;background:#fff;color:#111;font-family:"Comic Sans MS","Chalkboard SE","Trebuchet MS",sans-serif;display:flex;flex-direction:column;align-items:center;box-sizing:border-box;padding:0.18in 0.35in 0.12in}
.hw-head{width:100%;border-bottom:1px solid #888;padding-bottom:10px;text-align:center}
.hw-title{margin:0;font-size:26px;font-weight:700;line-height:1.15}
.hw-meta{margin-top:4px;display:flex;justify-content:space-between;align-items:baseline;font-size:14px;font-weight:700}
.hw-name{display:inline-flex;align-items:baseline;gap:6px}
.hw-name-line{display:inline-block;width:9rem;height:1.15em;border-bottom:1px solid #6b7280;vertical-align:baseline}
.hw-steps{width:100%;margin:8px 0 8px;font-size:15px;line-height:1.4;text-align:center}
.hw-cut{position:relative;width:4.5in;box-sizing:border-box;border:2px dashed #111;border-radius:28px;padding:0 10px 8px;display:flex;flex-direction:column;align-items:center}
.hw-top{display:block}
.hw-cutmark{position:absolute;right:-52px;top:1.55in;margin:0;display:flex;align-items:center;gap:3px;font-size:12px;font-weight:700}
.hw-art{display:block}
.hw-act{width:100%;margin-top:4px}
.hw-act-line,.hw-prompt{margin:0;font-size:14px;line-height:1.35;font-weight:700}
.hw-prompt{margin-top:6px}
.hw-wl{width:100%;height:32px;border-bottom:1px solid #888;box-sizing:border-box}
.hw-label{margin:6px 0 2px;font-size:18px;font-weight:700}
.hw-foot{width:100%;margin-top:8px;border-top:1px solid #888;padding-top:3px;text-align:center;font-size:12px;color:#444}
.hw-act text{fill:none;stroke:#888;stroke-width:1.15px}
@media print{.hw-page{width:auto;margin:0}}
`;
