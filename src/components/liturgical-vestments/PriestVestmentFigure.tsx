"use client";

import {
  VESTMENT_CHARACTER_IMAGES,
  VESTMENT_FIGURE_HEIGHT,
} from "@/lib/liturgical-vestments-assets";
import type { VestmentColor } from "@/lib/liturgical-vestments-game";
import Image from "next/image";

type Props = {
  /** Liturgical chasuble color; null = white alb only (no chasuble yet). */
  chasubleColor: VestmentColor | null;
};

export function PriestVestmentFigure({ chasubleColor }: Props) {
  const src = chasubleColor
    ? VESTMENT_CHARACTER_IMAGES.dressed(chasubleColor)
    : VESTMENT_CHARACTER_IMAGES.baseAlb;

  const alt = chasubleColor
    ? `Priest wearing ${chasubleColor} liturgical vestments`
    : "Priest in white alb";

  return (
    <div
      className="relative mx-auto w-full max-w-[300px]"
      style={{ aspectRatio: "1 / 2", maxHeight: VESTMENT_FIGURE_HEIGHT }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain object-bottom"
        sizes="300px"
        priority
        draggable={false}
      />
    </div>
  );
}
