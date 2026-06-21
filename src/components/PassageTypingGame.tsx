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
  /** Called when saving progress (auto on pass, or via Save button). */
  onSave?: (accuracy: number) => void | Promise<void>;
  /** @deprecated Use onSave */
  onComplete?: (accuracy: number) => void | Promise<void>;
  /** Fraction 0–1 required to count as complete (default 0.9). */
  accuracyThreshold?: number;
  /** Shown after a successful completion (e.g. sticker unlocked). */
  completionMessage?: React.ReactNode;
  /** Show Save next to Reset (e.g. Gospel / Bible stickers). */
  showSaveButton?: boolean;
};

/** Type-along UI for a passage (Today's Bible mode). */
export function PassageTypingGame({
  text,
  title = "Typing practice",
  onSave,
  onComplete,
  accuracyThreshold = 0.9,
  completionMessage,
  showSaveButton = false,
}: Props) {
  const persist = onSave ?? onComplete;
  const target = useMemo(() => normalizePassageText(text), [text]);
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const reportedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const passageRef = useRef<HTMLParagraphElement>(null);
  const nextCharRef = useRef<HTMLSpanElement>(null);

  const typedNorm = useMemo(() => normalizePassageText(typed), [typed]);
  const nextIndex = typedNorm.length;

  useEffect(() => {
    setTyped("");
    setStarted(false);
    setElapsedMs(0);
    setUnlocked(false);
    setSavePending(false);
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

  const passedThreshold = done && accuracy + 1e-9 >= accuracyThreshold;
  const elapsedSec = Math.floor(elapsedMs / 1000);

  const invokeSave = useCallback(
    async (options?: { requireThreshold?: boolean }) => {
      if (!persist || savePending) return;
      if (options?.requireThreshold && !passedThreshold) return;
      setSavePending(true);
      try {
        await persist(accuracy);
        setUnlocked(true);
      } finally {
        setSavePending(false);
      }
    },
    [persist, passedThreshold, savePending, accuracy],
  );

  useEffect(() => {
    if (!persist || !passedThreshold || reportedRef.current) return;
    reportedRef.current = true;
    void invokeSave({ requireThreshold: true });
  }, [persist, passedThreshold, invokeSave]);

  useEffect(() => {
    nextCharRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [nextIndex]);

  const reset = useCallback(() => {
    setTyped("");
    setStarted(false);
    setElapsedMs(0);
    setUnlocked(false);
    setSavePending(false);
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
        <p
          ref={passageRef}
          className="mb-4 max-h-48 overflow-y-auto font-mono text-sm leading-relaxed text-[var(--color-muted)]"
        >
          {target.split("").map((char, i) => {
            let className = "opacity-40";
            if (i < typedNorm.length) {
              className =
                typedNorm[i] === char
                  ? "font-semibold text-green-700 opacity-100"
                  : "bg-red-50 font-semibold text-red-600";
            } else if (i === nextIndex) {
              className =
                "underline decoration-2 underline-offset-2 decoration-[var(--color-accent)] opacity-100";
            }
            return (
              <span
                key={i}
                ref={i === nextIndex ? nextCharRef : undefined}
                className={className}
              >
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

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted)]">
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
          </div>
          <div className="flex flex-wrap gap-2">
            {showSaveButton && (
              <button
                type="button"
                onClick={() => void invokeSave()}
                disabled={!persist || savePending}
                className="border-2 border-[var(--color-accent)] bg-white px-4 py-1.5 font-semibold text-[var(--color-accent)] hover:bg-[var(--color-surface)] disabled:cursor-not-allowed disabled:border-[var(--color-border)] disabled:bg-[var(--color-surface)] disabled:text-[var(--color-muted)]"
              >
                {savePending ? "Saving…" : "Save"}
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              className="border border-[var(--color-border)] px-4 py-1.5 font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
            >
              Reset
            </button>
          </div>
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
