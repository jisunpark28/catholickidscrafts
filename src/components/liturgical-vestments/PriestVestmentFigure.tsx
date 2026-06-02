"use client";

import {
  VESTMENT_CHARACTER_IMAGES,
  VESTMENT_DEFAULT_COLOR,
  VESTMENT_CANVAS,
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
    <div className="flex justify-center overflow-visible py-1">
      <Image
        src={src}
        alt={alt}
        width={VESTMENT_CANVAS.width}
        height={VESTMENT_CANVAS.height}
        unoptimized
        className="h-auto w-auto max-h-[min(75vh,620px)] max-w-full object-contain"
        sizes="(max-width: 640px) 92vw, 440px"
        priority
        draggable={false}
      />
    </div>
  );
}
