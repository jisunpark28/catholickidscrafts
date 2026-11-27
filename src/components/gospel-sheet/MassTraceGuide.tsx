/**
 * Handwriting guide for Mass Level 1. Line positions come from the sheet font's
 * measured metrics (bold, Chromium, per 1px of font-size):
 * cap height 0.70, x-height 0.54, ascender 0.73, descender 0.21.
 * The top line is the cap line, the dashed line is the x-height, and the
 * bottom line is the baseline. Descenders hang in the padding under that line.
 * Font size is the largest that keeps the phrase on one line, with the cap
 * height capped near half an inch.
 */
const CAP = 0.7;
const X_HEIGHT = 0.54;
const ASCENDER = 0.73;
const DESCENDER = 0.21;
/**
 * Widest measured advance for these key lines: 50px at font-size 100
 * ("We gather in Jesus' name."). Used so a phrase cannot run past the card.
 */
const ADVANCE_AT_100 = 50;

export function MassTraceGuide({ text, maxWidth = 748 }: { text: string; maxWidth?: number }) {
  const fit = maxWidth / (Math.max(text.length, 1) * (ADVANCE_AT_100 / 100));
  const fontSize = Math.min(fit, 52 / CAP);
  const cap = fontSize * CAP;
  const xHeight = fontSize * X_HEIGHT;
  const ascender = fontSize * ASCENDER;
  const descender = fontSize * DESCENDER;
  const baseline = Math.ceil(ascender + 1);
  const height = Math.ceil(baseline + descender + 2);
  const capLine = baseline - cap;
  const xLine = baseline - xHeight;

  return (
    <svg
      className="gs-trace-svg"
      width="100%"
      height={height}
      role="img"
      aria-label={text}
      data-cap={cap.toFixed(1)}
      data-x={xHeight.toFixed(1)}
      data-baseline={baseline}
      data-font={fontSize.toFixed(1)}
    >
      <text
        x="0"
        y={baseline}
        fontSize={fontSize}
        fontWeight="700"
        fontFamily='"Comic Sans MS","Chalkboard SE","Trebuchet MS",sans-serif'
        fill="none"
        stroke="#888"
        strokeWidth="1.05"
        dominantBaseline="alphabetic"
      >
        {text}
      </text>
      <line x1="0" x2="100%" y1={capLine} y2={capLine} stroke="#888" strokeWidth="1" />
      <line x1="0" x2="100%" y1={xLine} y2={xLine} stroke="#888" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="0" x2="100%" y1={baseline} y2={baseline} stroke="#888" strokeWidth="1" />
    </svg>
  );
}
