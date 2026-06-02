"use client";

import {
  CHASUBLE_PALETTES,
  VESTMENT_VIEWBOX,
} from "@/lib/liturgical-vestments-assets";
import type { VestmentColor } from "@/lib/liturgical-vestments-game";

type Props = {
  /** Liturgical color chasuble; null = cassock only (before dressing). */
  chasubleColor: VestmentColor | null;
};

function CrossInQuatrefoil({
  cx,
  cy,
  r,
  fill,
  trim,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  trim: string;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={trim} strokeWidth={1.2} />
      <path
        d={`M${cx} ${cy - r * 0.45} v${r * 0.9} M${cx - r * 0.35} ${cy} h${r * 0.7}`}
        stroke={trim}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </g>
  );
}

function CassockBase() {
  return (
    <g id="cassock-base">
      {/* Head & face */}
      <ellipse cx={120} cy={52} rx={34} ry={38} fill="#f4d4b8" stroke="#3e2723" strokeWidth={1.5} />
      <ellipse cx={108} cy={50} rx={4} ry={5} fill="#3e2723" />
      <ellipse cx={132} cy={50} rx={4} ry={5} fill="#3e2723" />
      <path
        d="M108 62 Q120 70 132 62"
        fill="none"
        stroke="#8d6e63"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Collar */}
      <path
        d="M98 78 L120 88 L142 78 L138 98 L102 98 Z"
        fill="#fff"
        stroke="#3e2723"
        strokeWidth={1.2}
      />
      {/* Black cassock (soutane) */}
      <path
        d="M72 98 L48 200 L42 460 L198 460 L192 200 L168 98 Z"
        fill="#1a1a1a"
        stroke="#0d0d0d"
        strokeWidth={1.5}
      />
      <path
        d="M88 98 L72 180 L66 460 M152 98 L168 180 L174 460"
        fill="none"
        stroke="#333"
        strokeWidth={1}
        opacity={0.35}
      />
      {/* Sleeves */}
      <path
        d="M72 108 L28 200 L38 218 L78 130 Z"
        fill="#141414"
        stroke="#0d0d0d"
        strokeWidth={1.2}
      />
      <path
        d="M168 108 L212 200 L202 218 L162 130 Z"
        fill="#141414"
        stroke="#0d0d0d"
        strokeWidth={1.2}
      />
      {/* Hands */}
      <ellipse cx={36} cy={222} rx={12} ry={10} fill="#f4d4b8" stroke="#3e2723" strokeWidth={1} />
      <ellipse cx={204} cy={222} rx={12} ry={10} fill="#f4d4b8" stroke="#3e2723" strokeWidth={1} />
    </g>
  );
}

function AlbLayer() {
  return (
    <g id="alb">
      {/* Wide sleeves (arms raised slightly) */}
      <path
        d="M78 118 L18 210 L32 228 L88 145 Z"
        fill="#f7f2e8"
        stroke="#d7cfc0"
        strokeWidth={1.2}
      />
      <path
        d="M162 118 L222 210 L208 228 L152 145 Z"
        fill="#f7f2e8"
        stroke="#d7cfc0"
        strokeWidth={1.2}
      />
      {/* Alb body */}
      <path
        d="M82 118 L76 455 L164 455 L158 118 Q120 108 82 118 Z"
        fill="#faf6ee"
        stroke="#d7cfc0"
        strokeWidth={1.2}
      />
      {/* Cincture (rope belt) */}
      <path
        d="M74 248 Q120 258 166 248"
        fill="none"
        stroke="#c4a574"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M158 248 L168 278 L162 282 L152 252"
        fill="#c4a574"
        stroke="#a68b4b"
        strokeWidth={0.8}
      />
      <path
        d="M166 278 L172 292 M166 278 L160 292"
        stroke="#a68b4b"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </g>
  );
}

function ChasubleLayer({ color }: { color: VestmentColor }) {
  const p = CHASUBLE_PALETTES[color];

  return (
    <g id="chasuble">
      <path
        d="M58 128 Q120 118 182 128 L198 400 Q120 430 42 400 Z"
        fill={p.body}
        stroke="#1a1a1a"
        strokeWidth={1.2}
      />
      {/* Neck opening */}
      <path
        d="M98 128 Q120 142 142 128 L136 148 Q120 156 104 148 Z"
        fill="#1a1a1a"
      />
      {/* Y-shaped orphrey */}
      <path
        d="M120 138 L120 395 M120 175 L78 210 M120 175 L162 210"
        fill="none"
        stroke={p.orphrey}
        strokeWidth={22}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M120 138 L120 395 M120 175 L78 210 M120 175 L162 210"
        fill="none"
        stroke={p.trim}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Quatrefoil crosses on orphrey */}
      <CrossInQuatrefoil cx={120} cy={200} r={11} fill={p.orphrey} trim={p.trim} />
      <CrossInQuatrefoil cx={120} cy={248} r={11} fill={p.orphrey} trim={p.trim} />
      <CrossInQuatrefoil cx={120} cy={296} r={11} fill={p.orphrey} trim={p.trim} />
      <CrossInQuatrefoil cx={120} cy={344} r={11} fill={p.orphrey} trim={p.trim} />
      <CrossInQuatrefoil cx={120} cy={392} r={10} fill={p.orphrey} trim={p.trim} />
      <CrossInQuatrefoil cx={98} cy={198} r={9} fill={p.orphrey} trim={p.trim} />
      <CrossInQuatrefoil cx={142} cy={198} r={9} fill={p.orphrey} trim={p.trim} />
      {/* Outer gold trim on chasuble edge */}
      <path
        d="M58 128 Q120 118 182 128 L198 400 Q120 430 42 400 Z"
        fill="none"
        stroke={p.trim}
        strokeWidth={2}
      />
    </g>
  );
}

export function PriestVestmentFigure({ chasubleColor }: Props) {
  const dressed = chasubleColor !== null;

  return (
    <svg
      viewBox={`0 0 ${VESTMENT_VIEWBOX.width} ${VESTMENT_VIEWBOX.height}`}
      className="mx-auto block h-auto w-full max-w-[280px] select-none"
      role="img"
      aria-label={
        dressed
          ? `Priest wearing ${chasubleColor} liturgical vestments`
          : "Priest in black cassock"
      }
    >
      <CassockBase />
      {dressed && (
        <>
          <AlbLayer />
          <ChasubleLayer color={chasubleColor} />
        </>
      )}
    </svg>
  );
}
