"use client";

import {
  countMatchingChars,
  normalizePassageText,
  typingAccuracy,
} from "@/lib/typing-accuracy";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  text: string;
  title?: string;
  /** Called once when the passage is finished at or above accuracyThreshold. */
  onComplete?: (accuracy: number) => void;
  /** Fraction 0–1 required to count as complete (default 0.9). */
  accuracyThreshold?: number;
  /** Shown after a successful completion (e.g. sticker unlocked). */
  completionMessage?: React.ReactNode;
};

/** Type-along UI for a passage (Today's Bible mode). */
export function PassageTypingGame({
  text,
  title = "Typing practice",
  onComplete,
  accuracyThreshold = 0.9,
  completionMessage,
}: Props) {
  const target = useMemo(() => normalizePassageText(text), [text]);
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const reportedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);

  const typedNorm = useMemo(() => normalizePassageText(typed), [typed]);

  useEffect(() => {
    setTyped("");
    setStarted(false);
    setElapsedMs(0);
    setUnlocked(false);
    reportedRef.current = false;
    startTimeRef.current = null;
  }, [target]);

  const done = typedNorm.length >= target.length && target.length > 0;

  useEffect(() => {
    if (!started || done) return;
    const tick = () => {
      if (startTimeRef.current != null) {
        setElapsedMs(Date.now() - startTimeRef.current);
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => clearInterval(id);
  }, [started, done]);

  const accuracy = useMemo(
    () => typingAccuracy(typedNorm, target),
    [typedNorm, target],
  );

  const passedThreshold = done && accuracy >= accuracyThreshold;
  const elapsedSec = Math.floor(elapsedMs / 1000);

  useEffect(() => {
    if (!onComplete || !passedThreshold || reportedRef.current) return;
    reportedRef.current = true;
    setUnlocked(true);
    onComplete(accuracy);
  }, [onComplete, passedThreshold, accuracy]);

  const reset = useCallback(() => {
    setTyped("");
    setStarted(false);
    setElapsedMs(0);
    setUnlocked(false);
    reportedRef.current = false;
    startTimeRef.current = null;
  }, []);

  const beginTyping = useCallback(() => {
    if (startTimeRef.current == null) {
      startTimeRef.current = Date.now();
    }
    setStarted(true);
  }, []);

  if (!target) {
    return (
      <p className="text-sm text-[var(--color-muted)]">No text available for this reading.</p>
    );
  }

  return (
    <section className="border border-[var(--color-border)] bg-white">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
        <h2 className="text-lg font-bold text-[var(--color-ink)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Type the passage below. Correct letters turn green.
        </p>
      </div>

      <div className="px-6 py-6">
        <p className="mb-4 max-h-48 overflow-y-auto font-mono text-sm leading-relaxed text-[var(--color-muted)]">
          {target.split("").map((char, i) => {
            let className = "opacity-40";
            if (i < typedNorm.length) {
              className =
                typedNorm[i] === char
                  ? "font-semibold text-green-700 opacity-100"
                  : "bg-red-50 font-semibold text-red-600";
            } else if (i === typedNorm.length) {
              className = "underline decoration-[var(--color-accent)] opacity-100";
            }
            return (
              <span key={i} className={className}>
                {char}
              </span>
            );
          })}
        </p>

        <textarea
          value={typed}
          onChange={(e) => {
            beginTyping();
            setTyped(e.target.value);
          }}
          onPaste={(e) => e.preventDefault()}
          rows={6}
          className="w-full border border-[var(--color-border)] px-3 py-2 font-mono text-sm"
          placeholder="Start typing here…"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
        />

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted)]">
          <span>
            Accuracy: {Math.min(100, Math.round(accuracy * 100))}%
            {started && typedNorm.length > 0 && !done && (
              <span className="text-xs opacity-70">
                {" "}
                ({countMatchingChars(typedNorm, target)}/{target.length} chars)
              </span>
            )}
          </span>
          {started && <span>Time: {elapsedSec}s</span>}
          {passedThreshold && (
            <span className="font-bold text-[var(--color-accent)]">Praise sticker unlocked!</span>
          )}
          {done && !passedThreshold && (
            <span className="font-semibold text-amber-700">
              Finish with at least {Math.round(accuracyThreshold * 100)}% accuracy to unlock the
              sticker. Reset and try again.
            </span>
          )}
          <button
            type="button"
            onClick={reset}
            className="border border-[var(--color-border)] px-3 py-1 font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
          >
            Reset
          </button>
        </div>
        {unlocked && completionMessage && (
          <div className="mt-4 border border-[var(--color-accent)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)]">
            {completionMessage}
          </div>
        )}
      </div>
    </section>
  );
}
