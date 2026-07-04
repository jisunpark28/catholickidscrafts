"use client";

import {
  lessonFillBlankAnswers,
  lessonFillBlankParts,
} from "@/lib/lesson-kit/game-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";
import { useState } from "react";

type Props = {
  block: LessonBlockDto;
};

export function LessonFillBlankGame({ block }: Props) {
  const { parts, blankCount } = lessonFillBlankParts(block);
  const answers = lessonFillBlankAnswers(block);
  const [inputs, setInputs] = useState<string[]>(() => Array(blankCount).fill(""));
  const [checked, setChecked] = useState(false);

  if (!parts[0] || blankCount === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Use ___ in your sentence and add answers in the lesson editor.
      </p>
    );
  }

  const allCorrect =
    checked &&
    inputs.every((val, i) => val.trim().toLowerCase() === (answers[i] ?? "").trim().toLowerCase());

  return (
    <div className="lesson-game-panel">
      <p className="lesson-game-fillblank text-lg leading-relaxed text-[var(--color-ink)]">
        {parts.map((part, i) => (
          <span key={`${i}-${part}`}>
            {part}
            {i < blankCount ? (
              <input
                type="text"
                value={inputs[i] ?? ""}
                onChange={(e) => {
                  const next = [...inputs];
                  next[i] = e.target.value;
                  setInputs(next);
                  setChecked(false);
                }}
                className="lesson-game-fillblank__input mx-1 inline-block min-w-[6rem] border-b-2 border-[var(--color-accent)] bg-transparent px-1"
                aria-label={`Blank ${i + 1}`}
              />
            ) : null}
          </span>
        ))}
      </p>
      <button
        type="button"
        className="lesson-big-button mt-4 !min-h-0 !w-auto !px-5 !py-2"
        onClick={() => setChecked(true)}
      >
        Check answers
      </button>
      {checked ? (
        <p className={allCorrect ? "lesson-game-panel__success" : "lesson-game-panel__fail"}>
          {allCorrect ? "All blanks correct!" : "Some answers need another try."}
        </p>
      ) : null}
    </div>
  );
}
