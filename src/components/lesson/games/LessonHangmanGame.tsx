"use client";

import { lessonGameHint, lessonGameWords } from "@/lib/lesson-kit/game-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";
import { useMemo, useState } from "react";

const MAX_WRONG = 6;

type Props = {
  block: LessonBlockDto;
};

export function LessonHangmanGame({ block }: Props) {
  const words = lessonGameWords(block);
  const hint = lessonGameHint(block);
  const word = useMemo(() => {
    if (words.length === 0) return "";
    const pick = words[Math.floor(Math.random() * words.length)]!;
    return pick.toLowerCase().replace(/[^a-z]/gi, "");
  }, [words]);

  const [guessed, setGuessed] = useState<Set<string>>(() => new Set());
  const [wrong, setWrong] = useState(0);

  if (!word) {
    return <p className="text-sm text-[var(--color-muted)]">Add at least one word in the lesson editor.</p>;
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
    <div className="lesson-game-panel">
      {hint ? <p className="lesson-game-panel__hint">Hint: {hint}</p> : null}
      <p className="lesson-game-panel__status">
        Wrong guesses: {wrong} / {MAX_WRONG}
      </p>
      <p className="lesson-game-hangman__word" aria-live="polite">
        {display}
      </p>
      {won ? <p className="lesson-game-panel__success">You got it!</p> : null}
      {lost ? (
        <p className="lesson-game-panel__fail">
          The word was <strong>{word}</strong>.
        </p>
      ) : null}
      {!won && !lost ? (
        <div className="lesson-game-keyboard">
          {"abcdefghijklmnopqrstuvwxyz".split("").map((letter) => (
            <button
              key={letter}
              type="button"
              disabled={guessed.has(letter)}
              className="lesson-game-key"
              onClick={() => guess(letter)}
            >
              {letter.toUpperCase()}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
