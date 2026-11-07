"use client";

import {
  DEFAULT_READING_SIZE,
  parseReadingSize,
  READING_SIZE_KEY,
  READING_SIZES,
  stepReadingSize,
  type ReadingSize,
} from "@/lib/bible/reading-size";
import { useCallback, useLayoutEffect, useState } from "react";

function readStoredSize(): ReadingSize {
  try {
    return parseReadingSize(localStorage.getItem(READING_SIZE_KEY));
  } catch {
    return DEFAULT_READING_SIZE;
  }
}

/** Local preference for scripture text. Blocked or corrupt storage stays on the default. */
export function useReadingSize() {
  const [size, setSize] = useState<ReadingSize>(DEFAULT_READING_SIZE);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setSize(readStoredSize());
    setReady(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== READING_SIZE_KEY && event.key !== null) return;
      setSize(readStoredSize());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const change = useCallback((delta: -1 | 1) => {
    setSize((current) => {
      const next = stepReadingSize(current, delta);
      try {
        localStorage.setItem(READING_SIZE_KEY, String(next));
      } catch {
        /* In-memory size still updates when storage is blocked. */
      }
      return next;
    });
    setReady(true);
  }, []);

  return { size, change, ready };
}

export function ReadingSizeControls({
  size,
  change,
}: {
  size: ReadingSize;
  change: (delta: -1 | 1) => void;
}) {
  const min = READING_SIZES[0];
  const max = READING_SIZES[READING_SIZES.length - 1];
  return (
    <div className="bible-reader__size-controls" role="group" aria-label="Scripture reading text size">
      <button
        type="button"
        onClick={() => change(-1)}
        disabled={size === min}
        aria-label="Decrease reading text size"
      >
        A−
      </button>
      <output aria-live="polite">
        {size}px
      </output>
      <button
        type="button"
        onClick={() => change(1)}
        disabled={size === max}
        aria-label="Increase reading text size"
      >
        A+
      </button>
    </div>
  );
}
