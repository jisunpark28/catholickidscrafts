"use client";

import {
  countMatchingChars,
  normalizePassageText,
  typingAccuracy,
} from "@/lib/typing-accuracy";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@/styles/gospel-typing.css";

type Appearance = "default" | "gospel" | "bible";

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
  /** Hide the card title row (page supplies its own heading). */
  hideTitle?: boolean;
  /** Gospel hub styling — Nanum YeonJiCe, larger type, warm card. */
  appearance?: Appearance;
  /** Shorter passage for lesson / family mode. */
  maxChars?: number;
  /** Minimal chrome for lesson runner embed. */
  embedded?: boolean;
  /** Called when user reaches maxChars or completes (lesson flow). */
  onLessonStepReady?: () => void;
};

function usesGospelCharStyles(appearance: Appearance): boolean {
  return appearance === "gospel" || appearance === "bible";
}

function charClassName(
  appearance: Appearance,
  i: number,
  typedNorm: string,
  target: string,
  nextIndex: number,
): string {
  const char = target[i]!;
  if (i < typedNorm.length) {
    const correct = typedNorm[i] === char;
    if (usesGospelCharStyles(appearance)) {
      return correct ? "gospel-typing-char--correct" : "gospel-typing-char--wrong";
    }
    return correct
      ? "font-semibold text-green-700 opacity-100"
      : "bg-red-50 font-semibold text-red-600";
  }
  if (i === nextIndex) {
    if (usesGospelCharStyles(appearance)) {
      return "gospel-typing-char--next";
    }
    return "underline decoration-2 underline-offset-2 decoration-[var(--color-accent)] opacity-100";
  }
  return usesGospelCharStyles(appearance) ? "gospel-typing-char--pending" : "opacity-40";
}

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
  hideTitle = false,
  appearance = "default",
  maxChars,
  embedded = false,
  onLessonStepReady,
}: Props) {
  const isBible = appearance === "bible";
  const isGospel = appearance === "gospel" || isBible;
  const unlockSticker = onStickerUnlock ?? onComplete;
  const canSaveDraft = (showSaveButton ?? Boolean(draftKey)) && !embedded;
  const fullTarget = useMemo(() => normalizePassageText(text), [text]);
  const target = useMemo(() => {
    if (!maxChars || maxChars >= fullTarget.length) return fullTarget;
    const slice = fullTarget.slice(0, maxChars);
    const lastSpace = slice.lastIndexOf(" ");
    if (lastSpace > maxChars * 0.6) return slice.slice(0, lastSpace).trimEnd();
    return slice;
  }, [fullTarget, maxChars]);
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
  const passageScrollRef = useRef<HTMLParagraphElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollSyncLock = useRef(false);

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
      onLessonStepReady?.();
      return;
    }
    if (!unlockSticker || !passedThreshold || reportedRef.current) return;
    reportedRef.current = true;
    setUnlocked(true);
    void unlockSticker(accuracy);
    onLessonStepReady?.();
  }, [
    celebrateOnComplete,
    done,
    unlockSticker,
    passedThreshold,
    accuracy,
    onLessonStepReady,
  ]);

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

  const syncPaneScroll = useCallback((source: "passage" | "input") => {
    if (scrollSyncLock.current) return;
    const passageEl = passageScrollRef.current;
    const inputEl = textareaRef.current;
    if (!passageEl || !inputEl) return;
    scrollSyncLock.current = true;
    if (source === "passage") {
      inputEl.scrollTop = passageEl.scrollTop;
    } else {
      passageEl.scrollTop = inputEl.scrollTop;
    }
    requestAnimationFrame(() => {
      scrollSyncLock.current = false;
    });
  }, []);

  if (!target) {
    return (
      <p className="text-sm text-[var(--color-muted)]">No text available for this reading.</p>
    );
  }

  const sectionClass = embedded
    ? "gospel-typing"
    : isBible
      ? "gospel-typing gospel-typing--bible overflow-hidden rounded-2xl border border-[#e8e0d6] bg-[#fffaf5] shadow-sm"
      : isGospel
        ? "gospel-typing gospel-typing--hub overflow-hidden rounded-2xl border border-[#e8e0d6] bg-[#fffaf5] shadow-sm"
        : "border border-[var(--color-border)] bg-white";

  const headerClass = embedded
    ? "hidden"
    : hideTitle
      ? "hidden"
      : isGospel
        ? "border-b border-[#e8e0d6] bg-[#f5ebe0]/70 px-5 py-4 sm:px-8"
        : "border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4";

  const bodyClass = embedded
    ? "space-y-4"
    : isBible
      ? "gospel-typing__body px-4 py-5 sm:px-6 sm:py-6"
      : isGospel
        ? "gospel-typing__body px-5 py-6 sm:px-8 sm:py-8"
        : "space-y-5 px-6 py-6";

  const alignedColumns = isGospel && !embedded;
  const sidePaneSurface =
    "gospel-typing__pane-content rounded-xl border border-[#e8e0d6] text-[var(--color-ink)]";

  const passageClass = alignedColumns
    ? `gospel-typing-passage mb-0 overflow-y-auto ${sidePaneSurface} bg-[#fdf8f3]`
    : isBible
      ? "gospel-typing-passage mb-0 rounded-xl border border-[#e8e0d6] bg-[#fdf8f3] p-4 text-[var(--color-ink)] sm:p-6"
      : isGospel
        ? "gospel-typing-passage mb-0 overflow-y-auto rounded-xl border border-[#e8e0d6] bg-[#fdf8f3] p-5 text-[var(--color-ink)] sm:p-6"
        : "mb-4 max-h-48 overflow-y-auto font-mono text-sm leading-relaxed text-[var(--color-muted)]";

  const textareaClass = alignedColumns
    ? `gospel-typing-input w-full resize-none ${sidePaneSurface} bg-white shadow-inner focus:border-[#dfc9b0] focus:outline-none focus:ring-2 focus:ring-[#dfc9b0]/50`
    : isBible
      ? "gospel-typing-input w-full rounded-xl border border-[#e8e0d6] bg-white px-4 py-4 text-[var(--color-ink)] shadow-inner focus:border-[#dfc9b0] focus:outline-none focus:ring-2 focus:ring-[#dfc9b0]/50 sm:px-6 sm:py-5"
      : isGospel
        ? "gospel-typing-input w-full min-h-[13rem] resize-y rounded-xl border border-[#e8e0d6] bg-white px-5 py-4 text-[var(--color-ink)] shadow-inner focus:border-[#dfc9b0] focus:outline-none focus:ring-2 focus:ring-[#dfc9b0]/50 sm:min-h-[14rem] sm:px-6 sm:py-5"
        : "w-full border border-[var(--color-border)] px-3 py-2 font-mono text-sm";

  const statsClass = isGospel
    ? "flex flex-wrap items-center gap-x-5 gap-y-2 text-base text-[var(--color-muted)]"
    : "flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted)]";

  const saveBtnClass = isGospel
    ? "rounded-xl border-2 border-[#dfc9b0] bg-[#f5d4b8] px-5 py-2 text-sm font-bold text-[var(--color-ink)] transition hover:bg-[#f0c9a8] disabled:cursor-not-allowed disabled:opacity-50"
    : "border-2 border-[var(--color-accent)] bg-white px-4 py-1.5 font-semibold text-[var(--color-accent)] hover:bg-[var(--color-surface)] disabled:cursor-not-allowed disabled:border-[var(--color-border)] disabled:text-[var(--color-muted)]";

  const resetBtnClass = isGospel
    ? "rounded-xl border border-[#e8e0d6] bg-white px-5 py-2 text-sm font-bold text-[var(--color-ink)] transition hover:border-[#dfc9b0]"
    : "border border-[var(--color-border)] px-4 py-1.5 font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)]";

  const completionBoxClass = isGospel
    ? "mt-4 rounded-xl border border-[#dfc9b0] bg-[#fdf8f3] px-5 py-4 text-base text-[var(--color-ink)]"
    : "mt-4 border border-[var(--color-accent)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)]";

  const sideBySide = alignedColumns;

  const passagePanel = (
    <p
      ref={alignedColumns ? passageScrollRef : undefined}
      onScroll={alignedColumns ? () => syncPaneScroll("passage") : undefined}
      className={passageClass}
    >
      {target.split("").map((char, i) => (
        <span
          key={i}
          ref={i === nextIndex ? nextCharRef : undefined}
          className={charClassName(appearance, i, typedNorm, target, nextIndex)}
        >
          {char}
        </span>
      ))}
    </p>
  );

  const typingInput = (
    <textarea
      ref={alignedColumns ? textareaRef : undefined}
      value={typed}
      onChange={(e) => {
        beginTyping();
        setTyped(e.target.value);
      }}
      onPaste={(e) => e.preventDefault()}
      onScroll={alignedColumns ? () => syncPaneScroll("input") : undefined}
      rows={alignedColumns ? 1 : isBible ? 10 : isGospel ? 7 : 6}
      className={textareaClass}
      placeholder="Start typing here…"
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      aria-label="Type the passage"
    />
  );

  const controlsPanel = (
    <>
      <div className="space-y-3">
        <div className={statsClass}>
          <span>
            Accuracy: {Math.min(100, Math.round(accuracy * 100))}%
            {started && typedNorm.length > 0 && !done && (
              <span className={isGospel ? "text-sm opacity-70" : "text-xs opacity-70"}>
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
              className={saveBtnClass}
            >
              {draftSavePending ? "Saving…" : "Save"}
            </button>
          )}
          <button type="button" onClick={() => void reset()} className={resetBtnClass}>
            Reset
          </button>
        </div>
      </div>
      {unlocked && completionMessage && (
        <div className={completionBoxClass}>{completionMessage}</div>
      )}
    </>
  );

  if (embedded) {
    return (
      <section className={sectionClass}>
        <div className={bodyClass}>
          {passagePanel}
          {typingInput}
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClass}>
      <div className={headerClass}>
        <h2
          className={
            isGospel
              ? "text-xl font-bold text-[var(--color-ink)] sm:text-2xl"
              : "text-lg font-bold text-[var(--color-ink)]"
          }
        >
          {title}
        </h2>
        {!hideInstructions && (
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {sideBySide
              ? "Type the passage on the right. Correct letters turn green. Use Save to pause and continue later."
              : "Type the passage below. Correct letters turn green. Use Save to pause and continue later."}
          </p>
        )}
      </div>

      <div className={bodyClass}>
        {sideBySide ? (
          <>
            <div className="gospel-typing__columns">
              <div className="gospel-typing__passage-pane">
                <p className="gospel-typing__pane-label">Passage</p>
                {passagePanel}
              </div>
              <div className="gospel-typing__input-pane">
                <p className="gospel-typing__pane-label">Your typing</p>
                {typingInput}
              </div>
            </div>
            <div className="gospel-typing__footer">{controlsPanel}</div>
          </>
        ) : (
          <>
            {passagePanel}
            {typingInput}
            {controlsPanel}
          </>
        )}
      </div>
    </section>
  );
}
