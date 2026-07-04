"use client";

import { lessonTrueFalseItems } from "@/lib/lesson-kit/game-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";
import { useState } from "react";

type Props = {
  block: LessonBlockDto;
};

export function LessonTrueFalseGame({ block }: Props) {
  const items = lessonTrueFalseItems(block);
  const [responses, setResponses] = useState<Record<number, boolean | undefined>>({});

  if (items.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">Add true/false statements in the editor.</p>;
  }

  const answered = Object.keys(responses).length;
  const correct = items.filter((item, i) => responses[i] === item.answer).length;

  return (
    <ul className="lesson-game-list space-y-4">
      {items.map((item, i) => {
        const picked = responses[i];
        const show = picked !== undefined;
        const isRight = picked === item.answer;
        return (
          <li key={`${i}-${item.statement}`} className="lesson-game-quiz-item">
            <p className="font-semibold text-[var(--color-ink)]">{item.statement}</p>
            <div className="mt-2 flex gap-2">
              {([true, false] as const).map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  className={`lesson-game-choice ${picked === val ? "lesson-game-choice--active" : ""}`}
                  onClick={() => setResponses((r) => ({ ...r, [i]: val }))}
                >
                  {val ? "True" : "False"}
                </button>
              ))}
            </div>
            {show ? (
              <p className={isRight ? "lesson-game-panel__success" : "lesson-game-panel__fail"}>
                {isRight ? "Correct" : "Not quite"}
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
