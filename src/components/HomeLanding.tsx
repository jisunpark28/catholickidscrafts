"use client";

import { SketchbookFrame } from "@/components/SketchbookFrame";
import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import logo from "@/Logo.png";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

type Placement = { top: number; left: number };

type HomeCanvasLink = {
  id: string;
  copyKey: string;
  fallback: string;
  href: string;
  kind: "title" | "sentence";
};

const HOME_CANVAS_LINKS: HomeCanvasLink[] = [
  {
    id: "mass",
    copyKey: "home.canvas.mass",
    fallback: "Daily Mass",
    href: "/mass",
    kind: "title",
  },
  {
    id: "play",
    copyKey: "home.canvas.game",
    fallback: "Play Game",
    href: "/play",
    kind: "title",
  },
  {
    id: "resources",
    copyKey: "home.canvas.sentence",
    fallback: "Browse crafts and lessons by liturgical season.",
    href: "/resources",
    kind: "sentence",
  },
];

function randomPlacement(existing: Placement[], minDistance = 24): Placement {
  for (let attempt = 0; attempt < 80; attempt++) {
    const candidate = {
      top: 10 + Math.random() * 72,
      left: 6 + Math.random() * 82,
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

function buildPlacements(count: number): Placement[] {
  const result: Placement[] = [];
  for (let i = 0; i < count; i++) {
    result.push(randomPlacement(result));
  }
  return result;
}

const linkClassName: Record<HomeCanvasLink["kind"], string> = {
  title:
    "max-w-[min(88vw,20rem)] text-[clamp(1.75rem,5vw,3.25rem)] leading-tight",
  sentence:
    "max-w-[min(92vw,32rem)] text-[clamp(1.05rem,2.8vw,1.65rem)] leading-snug text-[var(--color-muted)]",
};

export function HomeLanding() {
  const copy = useSiteCopy();
  const t = (key: string, fallback: string) => textFromCopy(copy, key, fallback);
  const [shuffleKey, setShuffleKey] = useState(0);

  const placements = useMemo(
    () => buildPlacements(HOME_CANVAS_LINKS.length),
    [shuffleKey],
  );

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
          {HOME_CANVAS_LINKS.map((link, index) => {
            const { top, left } = placements[index];
            const label = t(link.copyKey, link.fallback);
            return (
              <Link
                key={link.id}
                href={link.href}
                className={`absolute -translate-x-1/2 -translate-y-1/2 font-sans text-[var(--color-ink)] transition hover:text-[var(--color-accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] ${linkClassName[link.kind]}`}
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                }}
              >
                {label}
              </Link>
            );
          })}
        </SketchbookFrame>
      </div>
    </div>
  );
}
