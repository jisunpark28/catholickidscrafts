"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const EMBED_SRC = "/games/face-to-emoji/index.html?embed=1";

export function FaceToEmojiEmbed() {
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
      // Browser may block fullscreen without a user gesture.
    }
  }, []);

  const iframeClassName = isFullscreen
    ? "h-full w-full flex-1 bg-[#f5f7fb]"
    : "h-[min(88vh,900px)] w-full bg-[#f5f7fb]";

  return (
    <div
      ref={frameRef}
      className={`relative flex flex-col border border-[var(--color-border)] bg-[#f5f7fb] ${
        isFullscreen ? "h-screen w-screen" : ""
      }`}
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
        title="Face to Emoji"
        src={EMBED_SRC}
        className={iframeClassName}
        allow="fullscreen"
      />
    </div>
  );
}
