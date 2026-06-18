type Props = {
  children: React.ReactNode;
  className?: string;
  /** Minimum height of the inner canvas area */
  minHeight?: string;
  "aria-label"?: string;
};

/**
 * Hand-drawn sketchbook frame (SVG pencil strokes, not a CSS border).
 */
export function SketchbookFrame({
  children,
  className = "",
  minHeight = "min(72dvh, 720px)",
  "aria-label": ariaLabel,
}: Props) {
  return (
    <div
      className={`relative w-full ${className}`}
      style={{ minHeight }}
      aria-label={ariaLabel}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-[#3d4654]"
        viewBox="0 0 1000 700"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* Outer wobbly pencil stroke */}
        <path
          d="M 28 36
             C 120 18, 280 28, 420 22
             S 780 30, 958 42
             C 982 120, 968 280, 976 420
             S 962 600, 948 668
             C 820 688, 520 678, 320 672
             S 80 662, 36 648
             C 18 520, 32 320, 24 180
             S 14 58, 28 36 Z"
          fill="#fffefb"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Inner sketch line (offset, lighter) */}
        <path
          d="M 44 52
             C 200 38, 360 48, 520 44
             S 860 50, 936 58
             C 948 200, 940 380, 944 520
             S 932 640, 920 652
             C 720 664, 400 656, 200 650
             S 56 638, 48 624
             C 40 480, 48 280, 42 140
             S 38 64, 44 52 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeOpacity="0.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Corner doodle marks */}
        <path
          d="M 52 48 L 68 62 M 948 52 L 932 66 M 52 652 L 66 638 M 948 648 L 934 634"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="relative z-10 h-full min-h-[inherit] w-full px-6 py-8 sm:px-10 sm:py-12">
        {children}
      </div>
    </div>
  );
}
