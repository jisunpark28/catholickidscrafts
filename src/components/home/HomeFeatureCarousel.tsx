"use client";

import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, type ReactNode, useCallback, useId, useRef, useState } from "react";

/** Theme shared by every slide: main colour (chip, button, hook) and a light tint (card gradient, frame). */
type Theme = { icon: string; color: string; tint: string };

export type HomeFeatureSlide = Theme & {
  id: string;
  title: string;
  hook: string;
  description: string;
  benefits: string[];
  badge?: string;
  cta: string;
  href: string;
  image: string;
  imageAlt: string;
  /** Address shown in the little browser frame, e.g. "catholickidscrafts.com/gospel". */
  frameUrl: string;
};

/** Custom first slide (this Sunday's sheet). Kept mounted so its state survives slide changes. */
export type HomeLeadSlide = Theme & {
  id: string;
  title: string;
  chipLabel: string;
  content: ReactNode;
};

type Props = {
  eyebrow: string;
  heading: string;
  subtitle: string;
  lead?: HomeLeadSlide | null;
  slides: HomeFeatureSlide[];
  prevLabel: string;
  nextLabel: string;
};

const ARROW =
  "absolute top-[150px] z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e7e3de] bg-white text-2xl leading-none text-[#1c1c1c] shadow-md transition hover:bg-[#fffdfb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400] lg:top-1/2 lg:h-11 lg:w-11 lg:-translate-y-1/2";

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";

/** Home "What you can do here": colour chips + themed slides, arrows + dots, no autoplay. */
export function HomeFeatureCarousel({ eyebrow, heading, subtitle, lead, slides, prevLabel, nextLabel }: Props) {
  const [index, setIndex] = useState(0);
  const baseId = useId();
  const headingId = `${baseId}-h`;
  const panelId = `${baseId}-panel`;
  const touchX = useRef<number | null>(null);
  const offset = lead ? 1 : 0;
  const count = slides.length + offset;

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  if (count === 0) return null;
  const onLead = lead != null && index === 0;
  const slide = onLead ? null : slides[index - offset]!;
  const theme: Theme = onLead ? lead : slide!;
  const items = [
    ...(lead ? [{ id: lead.id, label: lead.chipLabel, title: lead.title, icon: lead.icon, color: lead.color, tint: lead.tint }] : []),
    ...slides.map((s) => ({ id: s.id, label: s.title, title: s.title, icon: s.icon, color: s.color, tint: s.tint })),
  ];
  const vars = { "--c": theme.color, "--t": theme.tint } as CSSProperties;

  return (
    <section
      aria-roledescription="carousel"
      aria-labelledby={headingId}
      onKeyDown={(e) => {
        const t = e.target as HTMLElement;
        if (t.closest("input, textarea, select, [role=radio], [role=radiogroup], [contenteditable=true]")) return;
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        }
      }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d35400]">
        <span aria-hidden>✝ </span>
        {eyebrow}
      </p>
      <h2 id={headingId} className="mt-1 text-[22px] font-extrabold leading-tight text-[#1c1c1c] sm:text-[26px]">
        {heading}
      </h2>
      <p className="mb-3 mt-0.5 text-[15px] text-[#6b7280]">{subtitle}</p>

      <div className="relative -mx-4 mb-3 sm:mx-0">
        <div
          role="tablist"
          aria-label={heading}
          className="flex gap-2 overflow-x-auto px-4 pb-1 pr-10 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:px-0 sm:pr-0 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((it, i) => {
            const on = i === index;
            return (
              <button
                key={it.id}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={panelId}
                onClick={() => setIndex(i)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition ${FOCUS} ${
                  on ? "font-extrabold text-white shadow-md" : "border-[#ecdccc] font-semibold text-[#374151] hover:brightness-95"
                }`}
                style={on ? { background: it.color, borderColor: it.color } : { background: it.tint }}
              >
                <span aria-hidden>{it.icon} </span>
                {it.label}
              </button>
            );
          })}
        </div>
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent sm:hidden" />
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-label={items[index]!.title}
        style={{ ...vars, background: `linear-gradient(135deg, ${theme.tint}, #fdfaf7 62%)` }}
        className="relative overflow-hidden rounded-[28px] border border-[#f1e4d6] shadow-[0_14px_32px_-16px_rgba(211,84,0,0.35)]"
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
        <span aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-80" style={{ background: theme.tint }} />
        <span aria-hidden className="pointer-events-none absolute bottom-5 left-5 text-xl opacity-30" style={{ color: theme.color }}>✿</span>
        <span aria-hidden className="pointer-events-none absolute bottom-5 right-16 text-lg opacity-30" style={{ color: theme.color }}>♡</span>
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-3 text-sm opacity-30" style={{ color: theme.color }}>✦</span>

        {lead ? (
          <div
            role="group"
            aria-roledescription="slide"
            aria-label={`1 / ${count}: ${lead.title}`}
            hidden={!onLead}
            className="relative px-4 pb-12 pt-4 sm:px-16 sm:pt-7 lg:min-h-[22rem]"
          >
            {lead.content}
          </div>
        ) : null}

        {slide ? (
          <div
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${count}: ${slide.title}`}
            aria-live="polite"
            className="relative flex flex-col gap-5 px-4 pb-12 pt-4 sm:px-16 sm:pt-7 lg:min-h-[22rem] lg:flex-row lg:items-center lg:gap-9"
          >
            <div className="relative w-full p-1 sm:p-3 lg:w-[52%] lg:shrink-0">
              <div
                className="-rotate-2 overflow-hidden rounded-[14px] bg-white shadow-[0_18px_34px_-14px_rgba(0,0,0,0.35)]"
                style={{ boxShadow: `0 18px 34px -14px rgba(0,0,0,.35), 0 0 0 6px ${slide.tint}` }}
              >
                <div aria-hidden className="flex items-center gap-1.5 border-b border-[#eee] bg-[#f6f1ec] px-2.5 py-1.5">
                  <i className="h-2 w-2 rounded-full bg-[#e0d6cc]" />
                  <i className="h-2 w-2 rounded-full bg-[#e0d6cc]" />
                  <i className="h-2 w-2 rounded-full bg-[#e0d6cc]" />
                  <span className="ml-2 flex-1 truncate rounded-md bg-white px-2 py-0.5 text-[10px] text-[#8a8a8a]">{slide.frameUrl}</span>
                </div>
                <div className="relative aspect-[3/2] w-full">
                  <Image
                    key={slide.id}
                    src={slide.image}
                    alt={slide.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover object-left-top"
                  />
                </div>
              </div>
              {slide.badge ? (
                <span
                  className="absolute -right-1 bottom-0 rotate-6 rounded-full border-2 border-dashed bg-white px-3 py-1.5 text-[13px] font-extrabold shadow-[0_6px_14px_-6px_rgba(0,0,0,0.3)]"
                  style={{ borderColor: slide.color, color: slide.color }}
                >
                  {slide.badge}
                </span>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-1 flex-col lg:pr-4">
              <span className="text-[13px] font-bold" style={{ color: slide.color }}>
                {index + 1} / {count}
              </span>
              <h3 className="mb-1.5 mt-1.5 flex items-center gap-2.5 text-[23px] font-extrabold leading-tight text-[#1c1c1c] sm:text-[27px]">
                <span aria-hidden className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[14px] text-[22px]" style={{ background: slide.tint }}>
                  {slide.icon}
                </span>
                {slide.title}
              </h3>
              <p className="mb-1.5 text-[17px] font-bold" style={{ color: slide.color }}>{slide.hook}</p>
              <p className="mb-3 text-base leading-relaxed text-[#4b5563]">{slide.description}</p>
              {slide.benefits.length ? (
                <ul className="mb-4 flex flex-wrap gap-1.5">
                  {slide.benefits.map((b) => (
                    <li
                      key={b}
                      className="rounded-full border-[1.5px] bg-white px-2.5 py-1 text-[12.5px] font-bold"
                      style={{ color: slide.color, borderColor: slide.tint }}
                    >
                      ✓ {b}
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link
                href={slide.href}
                className={`rounded-full px-6 py-3 text-center text-[15px] font-extrabold text-white no-underline transition hover:brightness-95 sm:self-start ${FOCUS}`}
                style={{ background: slide.color, boxShadow: `0 8px 16px -8px ${slide.color}` }}
              >
                {slide.cta} <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        ) : null}

        <button type="button" className={`${ARROW} left-2 sm:left-4`} aria-label={prevLabel} onClick={() => go(-1)}>
          <span aria-hidden>‹</span>
        </button>
        <button type="button" className={`${ARROW} right-2 sm:right-4`} aria-label={nextLabel} onClick={() => go(1)}>
          <span aria-hidden>›</span>
        </button>

        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {items.map((s, i) => (
            <button
              key={s.id}
              type="button"
              tabIndex={-1}
              aria-label={`${i + 1} / ${count}: ${s.title}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6" : "w-2 bg-[#ecd9c6] hover:bg-[#d8cfc4]"}`}
              style={i === index ? { background: theme.color } : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
