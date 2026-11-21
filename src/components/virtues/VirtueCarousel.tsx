"use client";

import { GOSPEL_SHEET_CSS } from "@/components/gospel-sheet/sheet-styles";
import { LockedSheetPreview } from "@/components/resource/LockedSheetPreview";
import { SheetThumb } from "@/components/resource/SheetThumb";
import type { VirtueBundle } from "@/data/virtues/courage";
import { cardThumbSrc } from "@/lib/resource/card-meta";
import type { GospelSheetView } from "@/lib/gospel-sheet";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "@/styles/virtue-carousel.css";

type Slide =
  | { kind: "story"; cardId?: string; title: string; ref: string; summary: string }
  | { kind: "verse"; cardId: string; ref: string; text: string; note: string }
  | { kind: "scenario"; situation: string; questions: readonly string[] }
  | { kind: "commitment"; commitment: string; encouragement: string }
  | { kind: "worksheet" };

function slidesFor(virtue: VirtueBundle): Slide[] {
  return [
    ...virtue.stories.map((story) => ({ kind: "story" as const, ...story })),
    { kind: "verse" as const, ...virtue.keyVerse },
    ...virtue.scenarios.map((scenario) => ({ kind: "scenario" as const, ...scenario })),
    { kind: "commitment" as const, commitment: virtue.commitment, encouragement: virtue.encouragement },
    { kind: "worksheet" as const },
  ];
}

export function VirtueCarousel({
  virtue,
  isPlus,
  sheet,
  initialSlide = 0,
}: {
  virtue: VirtueBundle;
  isPlus: boolean;
  sheet: GospelSheetView | null;
  initialSlide?: number;
}) {
  const slides = slidesFor(virtue);
  const last = slides.length - 1;
  const [index, setIndex] = useState(() => Math.max(0, Math.min(last, initialSlide)));
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const router = useRouter();
  const uid = useId();

  const go = useCallback(
    (next: number) => {
      const n = Math.max(0, Math.min(last, next));
      setIndex(n);
      const url = new URL(window.location.href);
      url.searchParams.set("slide", String(n));
      window.history.replaceState(window.history.state, "", url.pathname + url.search);
    },
    [last],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        router.push("/virtues");
      } else if (event.key === "ArrowRight") go(index + 1);
      else if (event.key === "ArrowLeft") go(index - 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, index, router]);

  const onTouchStart = (event: React.TouchEvent) => {
    const point = event.touches[0];
    touch.current = point ? { x: point.clientX, y: point.clientY } : null;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touch.current;
    const point = event.changedTouches[0];
    touch.current = null;
    if (!start || !point) return;
    const dx = point.clientX - start.x;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(point.clientY - start.y)) return;
    go(dx < 0 ? index + 1 : index - 1);
  };

  const slide = slides[index]!;
  const overlay = (
    <div className="vcx" role="dialog" aria-modal="true" aria-labelledby={`${uid}-title`} data-virtue-carousel={virtue.slug} data-slide={index}>
      <div className="vcx-header">
        <span className="vcx-kicker">Virtues</span>
        <h2 id={`${uid}-title`} className="vcx-title">
          {virtue.name}
        </h2>
        <button ref={closeRef} className="vcx-close" type="button" aria-label="Close Courage" onClick={() => router.push("/virtues")}>
          ✕
        </button>
      </div>
      <div className="vcx-body" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="vcx-slide" aria-live="polite">
          {slide.kind === "story" ? <StorySlide slide={slide} /> : null}
          {slide.kind === "verse" ? <VerseSlide slide={slide} /> : null}
          {slide.kind === "scenario" ? <ScenarioSlide slide={slide} /> : null}
          {slide.kind === "commitment" ? (
            <>
              <p className="vcx-ref">I will…</p>
              <p className="vcx-verse">{slide.commitment}</p>
              <p className="vcx-copy">{slide.encouragement}</p>
            </>
          ) : null}
          {slide.kind === "worksheet" ? <WorksheetSlide virtue={virtue} isPlus={isPlus} sheet={sheet} /> : null}
        </div>
      </div>
      <div className="vcx-controls">
        <button type="button" className="vcx-arrow" aria-label="Previous" disabled={index === 0} onClick={() => go(index - 1)}>
          ‹
        </button>
        <div className="vcx-dots" aria-label={`Slide ${index + 1} of ${slides.length}`}>
          {slides.map((_, i) => (
            <span key={i} className={`vcx-dot${i === index ? " is-cur" : ""}`} />
          ))}
        </div>
        <button type="button" className="vcx-arrow vcx-next" aria-label="Next" disabled={index === last} onClick={() => go(index + 1)}>
          ›
        </button>
      </div>
    </div>
  );

  if (!mounted) return overlay;
  return createPortal(overlay, document.body);
}

function CardFace({ id, alt }: { id: string; alt: string }) {
  return (
    <div className="vcx-card">
      {/* Public 4:5 thumb. The full PNG stays on the Plus download route. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cardThumbSrc(id)} alt={alt} width={432} height={540} />
    </div>
  );
}

function StorySlide({ slide }: { slide: Extract<Slide, { kind: "story" }> }) {
  return (
    <>
      {slide.cardId ? <CardFace id={slide.cardId} alt={slide.title} /> : null}
      <p className="vcx-ref">{slide.ref}</p>
      <h3 className="vcx-h">{slide.title}</h3>
      <p className="vcx-copy">{slide.summary}</p>
    </>
  );
}

function VerseSlide({ slide }: { slide: Extract<Slide, { kind: "verse" }> }) {
  return (
    <>
      <CardFace id={slide.cardId} alt={slide.ref} />
      <p className="vcx-ref">{slide.ref}</p>
          <p className="vcx-verse">“{slide.text}”</p>
          <p className="vcx-copy">God knows you, and you matter to Him.</p>
    </>
  );
}

function ScenarioSlide({ slide }: { slide: Extract<Slide, { kind: "scenario" }> }) {
  return (
    <>
      <p className="vcx-ref">What would you do?</p>
      <h3 className="vcx-h">{slide.situation}</h3>
      <ul className="vcx-questions">
        {slide.questions.map((question) => (
          <li key={question} className="vcx-q">
            {question}
          </li>
        ))}
      </ul>
    </>
  );
}

function WorksheetSlide({
  virtue,
  isPlus,
  sheet,
}: {
  virtue: VirtueBundle;
  isPlus: boolean;
  sheet: GospelSheetView | null;
}) {
  return (
    <>
      <p className="vcx-ref">A sheet to take home</p>
      <h3 className="vcx-h">{virtue.worksheet.title}</h3>
      <p className="vcx-copy">Hang it on the fridge and practice courage through the week. Plus unlocks the printable.</p>
      <Link href={virtue.worksheet.href} className="vcx-sheet">
        <span className="vcx-sheet-pic">
          {isPlus && sheet ? (
            <>
              <style dangerouslySetInnerHTML={{ __html: GOSPEL_SHEET_CSS }} />
              <SheetThumb sheet={sheet} level={1} />
            </>
          ) : (
            <LockedSheetPreview title={virtue.worksheet.title} />
          )}
        </span>
        <span>
          <span className="vcx-sheet-name">{virtue.worksheet.title}</span>
          <span className="vcx-sheet-cta">Open worksheet →</span>
        </span>
      </Link>
    </>
  );
}
