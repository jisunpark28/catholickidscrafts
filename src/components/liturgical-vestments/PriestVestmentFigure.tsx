"use client";

import {
  VESTMENT_CHARACTER_IMAGES,
  VESTMENT_DEFAULT_COLOR,
} from "@/lib/liturgical-vestments-assets";
import type { VestmentColor } from "@/lib/liturgical-vestments-game";
import Image from "next/image";

type Props = {
  /** Chasuble color; null shows the default white figure. */
  chasubleColor: VestmentColor | null;
};

const EXTRA_HEAD_PAD: VestmentColor[] = ["green", "purple", "lavender"];

export function PriestVestmentFigure({ chasubleColor }: Props) {
  const displayColor = chasubleColor ?? VESTMENT_DEFAULT_COLOR;
  const src = VESTMENT_CHARACTER_IMAGES.dressed(displayColor);
  const headPad = EXTRA_HEAD_PAD.includes(displayColor);

  const alt =
    displayColor === VESTMENT_DEFAULT_COLOR && !chasubleColor
      ? "Priest in white alb"
      : `Priest wearing ${displayColor} liturgical vestments`;

  return (
    <div
      className={`flex justify-center overflow-visible ${headPad ? "pt-4 sm:pt-6" : "pt-1"}`}
    >
      <Image
        src={src}
        alt={alt}
        width={480}
        height={1000}
        unoptimized
        className={`h-auto w-auto max-w-full object-contain object-top ${
          headPad
            ? "max-h-[min(78vh,640px)]"
            : "max-h-[min(72vh,580px)]"
        }`}
        sizes="(max-width: 640px) 90vw, 440px"
        priority
        draggable={false}
      />
    </div>
  );
}
