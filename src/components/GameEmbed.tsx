"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  title: string;
  src: string;
  description?: string;
  /** Show mobile/desktop tip under the title (off for hangman, etc.). */
  showTip?: boolean;
  /** Use more of the viewport height (Tiny Priest church game). */
  immersive?: boolean;
};

export function GameEmbed({
  title,
  src,
  description,
  showTip = true,
  immersive = false,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === frameRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = frameRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      // Ignore if the browser blocks fullscreen (permissions, unsupported).
    }
  }, []);

  return (
    <div>
      <Link
        href="/play"
        className="text-sm font-semibold text-[var(--color-link)] hover:underline"
      >
        ← Play & learn
      </Link>
      <header className="mt-6 border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5">
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm text-[var(--color-muted)]">{description}</p>
        ) : null}
        {showTip ? (
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            In class: one laptop on the projector, or rotate one child at a time. Use Fullscreen for
            a larger play area; keyboard games work best on a computer.
          </p>
        ) : null}
      </header>
      <div
        ref={frameRef}
        className={`relative mt-4 border border-[var(--color-border)] bg-black ${isFullscreen ? "h-screen w-screen" : ""}`}
      >
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          className="absolute right-2 top-2 z-10 border border-[var(--color-border)] bg-white/95 px-3 py-1.5 text-xs font-bold text-[var(--color-ink)] shadow-sm hover:border-[var(--color-accent)]"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>
        <iframe
          title={title}
          src={src}
          className={
            immersive
              ? "h-[min(calc(100svh-15rem),860px)] w-full bg-white"
              : "h-[min(80vh,720px)] w-full bg-white"
          }
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
