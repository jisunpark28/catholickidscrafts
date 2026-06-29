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
  /** Unique key for draft save/load (e.g. bible:genesis:1). */
  draftKey?: string;
  /** Sticker unlock only — called automatically at 90%+ completion. */
  onStickerUnlock?: (accuracy: number) => void | Promise<void>;
  /** @deprecated Use onStickerUnlock */
  onComplete?: (accuracy: number) => void | Promise<void>;
  /** Fraction 0–1 required to unlock sticker (default 0.9). */
  accuracyThreshold?: number;
  /** Shown after sticker unlock. */
  completionMessage?: React.ReactNode;
  /** Show completionMessage when the passage is finished (practice mode, no sticker). */
  celebrateOnComplete?: boolean;
  /** Show Save draft button (defaults to true when draftKey is set). */
  showSaveButton?: boolean;
  /** Hide the default typing instructions under the title. */
  hideInstructions?: boolean;
};

/** Type-along UI for a passage (Today's Bible mode). */
export function PassageTypingGame({
  text,
  title = "Typing practice",
  draftKey,
  onStickerUnlock,
  onComplete,
  accuracyThreshold = 0.9,
  completionMessage,
  celebrateOnComplete = false,
  showSaveButton,
  hideInstructions = false,
}: Props) {
  const unlockSticker = onStickerUnlock ?? onComplete;
  const canSaveDraft = showSaveButton ?? Boolean(draftKey);
  const target = useMemo(() => normalizePassageText(text), [text]);
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [draftSavePending, setDraftSavePending] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftError, setDraftError] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const reportedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const nextCharRef = useRef<HTMLSpanElement>(null);

  const typedNorm = useMemo(() => normalizePassageText(typed), [typed]);
  const nextIndex = typedNorm.length;

  const resetLocal = useCallback(() => {
    setTyped("");
    setStarted(false);
    setElapsedMs(0);
    setUnlocked(false);
    setDraftSavePending(false);
    setDraftSaved(false);
    setDraftError("");
    reportedRef.current = false;
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    resetLocal();
    setDraftLoaded(false);
  }, [target, draftKey, resetLocal]);

  useEffect(() => {
    if (!draftKey || draftLoaded) return;
    let cancelled = false;
    void fetch(`/api/typing/draft?draftKey=${encodeURIComponent(draftKey)}`)
      .then((res) => res.json())
      .then((data: { typedText?: string; elapsedMs?: number | null }) => {
        if (cancelled) return;
        const savedText = data.typedText ?? "";
        if (savedText.length > 0) {
          setTyped(savedText);
          setStarted(true);
          const ms = data.elapsedMs ?? 0;
          setElapsedMs(ms);
          startTimeRef.current = Date.now() - ms;
        }
        setDraftLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setDraftLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [draftKey, draftLoaded]);

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

  const saveDraft = useCallback(async () => {
    if (!draftKey || draftSavePending) return;
    setDraftSavePending(true);
    setDraftError("");
    setDraftSaved(false);
    try {
      const res = await fetch("/api/typing/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftKey, typedText: typed, elapsedMs }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Could not save draft");
      }
      setDraftSaved(true);
    } catch (e) {
      setDraftError(e instanceof Error ? e.message : "Could not save draft");
    } finally {
      setDraftSavePending(false);
    }
  }, [draftKey, draftSavePending, typed, elapsedMs]);

  useEffect(() => {
    if (celebrateOnComplete && done && !reportedRef.current) {
      reportedRef.current = true;
      setUnlocked(true);
      return;
    }
    if (!unlockSticker || !passedThreshold || reportedRef.current) return;
    reportedRef.current = true;
    setUnlocked(true);
    void unlockSticker(accuracy);
  }, [celebrateOnComplete, done, unlockSticker, passedThreshold, accuracy]);

  useEffect(() => {
    nextCharRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [nextIndex]);

  const reset = useCallback(async () => {
    if (draftKey) {
      await fetch(`/api/typing/draft?draftKey=${encodeURIComponent(draftKey)}`, {
        method: "DELETE",
      }).catch(() => {});
    }
    resetLocal();
    setDraftLoaded(true);
  }, [draftKey, resetLocal]);

  const beginTyping = useCallback(() => {
    if (startTimeRef.current == null) {
      startTimeRef.current = Date.now();
    }
    setStarted(true);
    setDraftSaved(false);
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
        {!hideInstructions && (
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Type the passage below. Correct letters turn green. Use Save to pause and continue
            later.
          </p>
        )}
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
            {draftSaved && (
              <span className="font-semibold text-green-700">Draft saved — you can continue later.</span>
            )}
          </div>
          {draftError && <p className="text-sm text-red-600">{draftError}</p>}
          <div className="flex flex-wrap gap-2">
            {canSaveDraft && draftKey && (
              <button
                type="button"
                onClick={() => void saveDraft()}
                disabled={draftSavePending}
                className="border-2 border-[var(--color-accent)] bg-white px-4 py-1.5 font-semibold text-[var(--color-accent)] hover:bg-[var(--color-surface)] disabled:cursor-not-allowed disabled:border-[var(--color-border)] disabled:text-[var(--color-muted)]"
              >
                {draftSavePending ? "Saving…" : "Save"}
              </button>
            )}
            <button
              type="button"
              onClick={() => void reset()}
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
