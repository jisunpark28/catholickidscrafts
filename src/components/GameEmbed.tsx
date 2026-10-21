"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  title: string;
  src: string;
  description?: string;
  /** Show mobile/desktop tip under the title (off for hangman, etc.). */
  showTip?: boolean;
  /** Taller iframe; game provides its own fullscreen control (Come to Mass!). */
  immersive?: boolean;
  /** Taller iframe for games with a large illustration (Hangman). */
  tall?: boolean;
};

export function GameEmbed({
  title,
  src,
  description,
  showTip = true,
  immersive = false,
  tall = false,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const showFrameFullscreen = !immersive;

  useEffect(() => {
    if (!showFrameFullscreen) return;
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === frameRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [showFrameFullscreen]);

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

  const iframeClassName = isFullscreen
    ? "h-full w-full flex-1 bg-white"
    : immersive
      ? // Phones: nearly edge-to-edge (header is trimmed below 640px); desktop keeps the framed size.
        "h-[calc(100svh-7.5rem)] w-full bg-white sm:h-[min(calc(100svh-15rem),860px)]"
      : tall
        ? "h-[min(88vh,820px)] w-full bg-white"
        : "h-[min(80vh,720px)] w-full bg-white";

  return (
    <div>
      <Link
        href="/play"
        className="text-sm font-semibold text-[var(--color-link)] hover:underline"
      >
        ← Play & learn
      </Link>
      <header
        className={`border border-[var(--color-border)] bg-[var(--color-surface)] ${
          immersive ? "mt-3 px-4 py-2 sm:mt-6 sm:px-6 sm:py-5" : "mt-6 px-6 py-5"
        }`}
      >
        <h1
          className={`font-bold text-[var(--color-ink)] ${immersive ? "text-lg sm:text-2xl" : "text-2xl"}`}
        >
          {title}
        </h1>
        {description ? (
          <p className={`mt-2 text-sm text-[var(--color-muted)] ${immersive ? "hidden sm:block" : ""}`}>
            {description}
          </p>
        ) : null}
        {showTip ? (
          <p className={`mt-3 text-xs text-[var(--color-muted)] ${immersive ? "hidden sm:block" : ""}`}>
            {immersive
              ? "Use Fullscreen in the game (top right) for a larger play area. On a computer use the arrow keys; on a phone or tablet tap the floor or use the on-screen arrows."
              : "In class: one laptop on the projector, or rotate one child at a time. Use Fullscreen for a larger play area; keyboard games work best on a computer."}
          </p>
        ) : null}
      </header>
      <div
        ref={frameRef}
        className={`relative ${immersive ? "mt-2 sm:mt-4" : "mt-4"} flex flex-col border border-[var(--color-border)] bg-white ${
          isFullscreen ? "h-screen w-screen" : ""
        }`}
      >
        {showFrameFullscreen ? (
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="absolute right-2 top-2 z-10 border border-[var(--color-border)] bg-white/95 px-3 py-1.5 text-xs font-bold text-[var(--color-ink)] shadow-sm hover:border-[var(--color-accent)]"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </button>
        ) : null}
        <iframe
          title={title}
          src={src}
          className={iframeClassName}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
