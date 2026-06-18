"use client";

import { SketchbookFrame } from "@/components/SketchbookFrame";
import logo from "@/Logo.png";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

type Placement = { top: number; left: number };

const HOME_LINKS = [
  { id: "mass", label: "Daily Mass", href: "/mass" },
  { id: "play", label: "Play Game", href: "/play" },
] as const;

function randomPlacement(existing: Placement[], minDistance = 28): Placement {
  for (let attempt = 0; attempt < 64; attempt++) {
    const candidate = {
      top: 12 + Math.random() * 68,
      left: 8 + Math.random() * 78,
    };
    const farEnough = existing.every((p) => {
      const dx = p.left - candidate.left;
      const dy = p.top - candidate.top;
      return Math.hypot(dx, dy) >= minDistance;
    });
    if (farEnough) return candidate;
  }
  return { top: 20 + Math.random() * 55, left: 10 + Math.random() * 70 };
}

function buildPlacements(): Placement[] {
  const result: Placement[] = [];
  for (let i = 0; i < HOME_LINKS.length; i++) {
    result.push(randomPlacement(result));
  }
  return result;
}

export function HomeLanding() {
  const [shuffleKey, setShuffleKey] = useState(0);

  const placements = useMemo(() => buildPlacements(), [shuffleKey]);

  const reshuffle = useCallback(() => {
    setShuffleKey((k) => k + 1);
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      <div className="flex shrink-0 justify-center px-4 pt-8 sm:pt-12">
        <button
          type="button"
          onClick={reshuffle}
          className="rounded-lg bg-transparent transition hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
          aria-label="Catholic Kids Crafts — shuffle home links"
        >
          <Image
            src={logo}
            alt="Catholic Kids Crafts logo"
            className="block w-auto object-contain drop-shadow-sm"
            style={{ height: "clamp(72px, 14vw, 120px)", width: "auto" }}
            priority
          />
        </button>
      </div>

      <div className="relative mx-auto w-full max-w-[1600px] flex-1 px-4 pb-16 pt-6 sm:px-8 sm:pb-20">
        <SketchbookFrame aria-label="Home navigation canvas">
          {HOME_LINKS.map((link, index) => {
            const { top, left } = placements[index];
            return (
              <Link
                key={link.id}
                href={link.href}
                className="absolute max-w-[min(88vw,20rem)] -translate-x-1/2 -translate-y-1/2 font-sans text-[clamp(1.75rem,5vw,3.25rem)] leading-tight text-[var(--color-ink)] transition hover:text-[var(--color-accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </SketchbookFrame>
      </div>
    </div>
  );
}
