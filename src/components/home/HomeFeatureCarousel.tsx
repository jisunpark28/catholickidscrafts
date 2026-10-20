"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useId, useRef, useState } from "react";

export type HomeFeatureSlide = {
  id: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  image: string;
  imageAlt: string;
};

type Props = {
  heading: string;
  slides: HomeFeatureSlide[];
  prevLabel: string;
  nextLabel: string;
};

const ARROW =
  "absolute top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e7e3de] bg-white text-2xl leading-none text-[#1c1c1c] shadow-md transition hover:bg-[#fffdfb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";

/** Home "What you can do here" carousel: one feature per slide, arrows + dots, no autoplay. */
export function HomeFeatureCarousel({ heading, slides, prevLabel, nextLabel }: Props) {
  const [index, setIndex] = useState(0);
  const headingId = useId();
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  if (count === 0) return null;
  const slide = slides[index]!;

  return (
    <section
      aria-roledescription="carousel"
      aria-labelledby={headingId}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        }
      }}
    >
      <h2 id={headingId} className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
        {heading}
      </h2>
      <div
        className="relative overflow-hidden rounded-2xl border border-[#e7e3de] bg-[#fdfaf7]"
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          const end = e.changedTouches[0]?.clientX;
          touchX.current = null;
          if (start == null || end == null) return;
          const dx = end - start;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        <div
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} / ${count}: ${slide.title}`}
          aria-live="polite"
          className="flex flex-col gap-6 px-4 pb-14 pt-4 sm:px-16 sm:pt-7 lg:min-h-[36rem] lg:flex-row lg:items-center lg:gap-10"
        >
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl border border-[#e7e3de] bg-white shadow-lg lg:w-[58%] lg:shrink-0">
            <Image
              key={slide.id}
              src={slide.image}
              alt={slide.imageAlt}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover object-left-top"
              priority={index === 0}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col lg:pr-6">
            <span className="text-sm font-semibold text-[#d35400]">
              {index + 1} / {count}
            </span>
            <h3 className="mb-3 mt-2 text-2xl font-bold leading-tight text-[#1c1c1c] sm:text-3xl">
              {slide.title}
            </h3>
            <p className="mb-6 text-base leading-relaxed text-[#4b5563]">{slide.description}</p>
            <Link
              href={slide.href}
              className="self-start rounded-full bg-[#d35400] px-6 py-3 text-[15px] font-semibold text-white no-underline transition hover:bg-[#b84a00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]"
            >
              {slide.cta} <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <button type="button" className={`${ARROW} left-2 sm:left-4`} aria-label={prevLabel} onClick={() => go(-1)}>
          <span aria-hidden>‹</span>
        </button>
        <button type="button" className={`${ARROW} right-2 sm:right-4`} aria-label={nextLabel} onClick={() => go(1)}>
          <span aria-hidden>›</span>
        </button>

        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`${i + 1} / ${count}: ${s.title}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400] ${
                i === index ? "w-6 bg-[#d35400]" : "w-2 bg-[#e7e3de] hover:bg-[#d8cfc4]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
