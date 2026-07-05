"use client";

import { lessonKitWords } from "@/lib/lesson-kit/kit-words";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";
import { useCallback, useMemo, useState } from "react";

const MAX_WRONG = 6;

type Props = {
  block: LessonBlockDto;
  compact?: boolean;
};

export function LessonKitHangmanGame({ block, compact = false }: Props) {
  const entries = lessonKitWords(block);
  const words = useMemo(() => entries.map((e) => e.word), [entries]);

  const pickWord = useCallback(() => {
    if (words.length === 0) return { word: "", hint: "" };
    const entry = entries[Math.floor(Math.random() * entries.length)]!;
    const normalized = entry.word.toLowerCase().replace(/[^a-z]/gi, "");
    return { word: normalized, hint: entry.hint ?? "" };
  }, [entries, words.length]);

  const [round, setRound] = useState(() => pickWord());
  const [guessed, setGuessed] = useState<Set<string>>(() => new Set());
  const [wrong, setWrong] = useState(0);

  const word = round.word;
  const hint = round.hint;

  const startNewRound = useCallback(() => {
    setRound(pickWord());
    setGuessed(new Set());
    setWrong(0);
  }, [pickWord]);

  if (!word) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Add words in the lesson editor before running hangman in class.
      </p>
    );
  }

  const letters = new Set(word.split(""));
  const won = [...letters].every((ch) => guessed.has(ch));
  const lost = wrong >= MAX_WRONG;

  const display = word
    .split("")
    .map((ch) => (guessed.has(ch) ? ch.toUpperCase() : "_"))
    .join(" ");

  const guess = (letter: string) => {
    const ch = letter.toLowerCase();
    if (guessed.has(ch) || lost || won) return;
    const next = new Set(guessed);
    next.add(ch);
    setGuessed(next);
    if (!word.includes(ch)) {
      setWrong((w) => w + 1);
    }
  };

  return (
    <div className={`lesson-kit-hangman ${compact ? "lesson-kit-hangman--compact" : ""}`}>
      {hint ? <p className="lesson-kit-hangman__hint">Hint: {hint}</p> : null}
      <p className="lesson-kit-hangman__status">
        Wrong guesses: {wrong} / {MAX_WRONG}
      </p>
      <p className="lesson-kit-hangman__word" aria-live="polite">
        {display}
      </p>
      {won ? <p className="lesson-kit-hangman__banner lesson-kit-hangman__banner--win">You got it!</p> : null}
      {lost ? (
        <p className="lesson-kit-hangman__banner lesson-kit-hangman__banner--lose">
          The word was <strong>{word}</strong>.
        </p>
      ) : null}
      {!won && !lost ? (
        <div className="lesson-kit-hangman__keyboard">
          {"abcdefghijklmnopqrstuvwxyz".split("").map((letter) => (
            <button
              key={letter}
              type="button"
              disabled={guessed.has(letter)}
              className="lesson-kit-hangman__key"
              onClick={() => guess(letter)}
            >
              {letter.toUpperCase()}
            </button>
          ))}
        </div>
      ) : (
        <button type="button" className="lesson-big-button mt-4" onClick={startNewRound}>
          New word
        </button>
      )}
    </div>
  );
}
