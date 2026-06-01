"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  text: string;
  title?: string;
};

/** Type-along UI for a passage (Today's Bible mode). */
export function PassageTypingGame({ text, title = "Typing practice" }: Props) {
  const target = useMemo(() => text.replace(/\s+/g, " ").trim(), [text]);
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setTyped("");
    setStarted(false);
    setElapsed(0);
  }, [target]);

  useEffect(() => {
    if (!started || typed.length >= target.length) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [started, typed.length, target.length]);

  const done = typed.length >= target.length && target.length > 0;
  const correctPrefix = useMemo(() => {
    let i = 0;
    while (i < typed.length && typed[i] === target[i]) i++;
    return i;
  }, [typed, target]);

  const reset = useCallback(() => {
    setTyped("");
    setStarted(false);
    setElapsed(0);
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
            if (i < typed.length) {
              className =
                typed[i] === char
                  ? "font-semibold text-green-700 opacity-100"
                  : "bg-red-50 font-semibold text-red-600";
            } else if (i === typed.length) {
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
            if (!started) setStarted(true);
            setTyped(e.target.value);
          }}
          onPaste={(e) => e.preventDefault()}
          rows={4}
          className="w-full border border-[var(--color-border)] px-3 py-2 font-mono text-sm"
          placeholder="Start typing here…"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
        />

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted)]">
          <span>
            Progress: {Math.min(100, Math.round((correctPrefix / target.length) * 100))}%
          </span>
          {started && <span>Time: {elapsed}s</span>}
          {done && <span className="font-bold text-[var(--color-accent)]">Well done!</span>}
          <button
            type="button"
            onClick={reset}
            className="border border-[var(--color-border)] px-3 py-1 font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
