"use client";

import { lessonMultipleChoiceItems } from "@/lib/lesson-kit/game-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";
import { useState } from "react";

type Props = {
  block: LessonBlockDto;
};

export function LessonMultipleChoiceGame({ block }: Props) {
  const items = lessonMultipleChoiceItems(block);
  const [responses, setResponses] = useState<Record<number, number | undefined>>({});

  if (items.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">Add multiple-choice questions in the editor.</p>;
  }

  const answered = Object.keys(responses).length;
  const correct = items.filter((item, i) => responses[i] === item.correctIndex).length;

  return (
    <ul className="lesson-game-list space-y-5">
      {items.map((item, i) => {
        const picked = responses[i];
        const show = picked !== undefined;
        const isRight = picked === item.correctIndex;
        return (
          <li key={`${i}-${item.question}`} className="lesson-game-quiz-item">
            <p className="font-semibold text-[var(--color-ink)]">{item.question}</p>
            <div className="mt-2 flex flex-col gap-2">
              {item.choices.map((choice, ci) => (
                <button
                  key={`${ci}-${choice}`}
                  type="button"
                  className={`lesson-game-choice lesson-game-choice--block ${
                    picked === ci ? "lesson-game-choice--active" : ""
                  }`}
                  onClick={() => setResponses((r) => ({ ...r, [i]: ci }))}
                >
                  {choice}
                </button>
              ))}
            </div>
            {show ? (
              <p className={isRight ? "lesson-game-panel__success" : "lesson-game-panel__fail"}>
                {isRight ? "Correct" : `Answer: ${item.choices[item.correctIndex]}`}
              </p>
            ) : null}
          </li>
        );
      })}
      {answered === items.length ? (
        <p className="text-sm font-semibold text-[var(--color-ink)]">
          Score: {correct} / {items.length}
        </p>
      ) : null}
    </ul>
  );
}
