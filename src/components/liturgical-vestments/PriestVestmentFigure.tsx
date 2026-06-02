"use client";

import {
  VESTMENT_CHARACTER_IMAGES,
  VESTMENT_DEFAULT_COLOR,
} from "@/lib/liturgical-vestments-assets";
import type { VestmentColor } from "@/lib/liturgical-vestments-game";
import Image from "next/image";

type Props = {
  chasubleColor: VestmentColor | null;
};

export function PriestVestmentFigure({ chasubleColor }: Props) {
  const displayColor = chasubleColor ?? VESTMENT_DEFAULT_COLOR;
  const src = VESTMENT_CHARACTER_IMAGES.dressed(displayColor);

  const alt =
    displayColor === VESTMENT_DEFAULT_COLOR && !chasubleColor
      ? "Priest in white alb"
      : `Priest wearing ${displayColor} liturgical vestments`;

  return (
    <div className="flex justify-center overflow-visible pt-1">
      <Image
        src={src}
        alt={alt}
        width={960}
        height={1040}
        unoptimized
        className="h-auto max-h-[min(72vh,580px)] w-auto max-w-full object-contain object-bottom"
        sizes="(max-width: 640px) 90vw, 420px"
        priority
        draggable={false}
      />
    </div>
  );
}
