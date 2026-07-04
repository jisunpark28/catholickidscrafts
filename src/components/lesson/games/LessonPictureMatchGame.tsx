"use client";

import { lessonPictureMatchPairs } from "@/lib/lesson-kit/game-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";
import { useState } from "react";

type Props = {
  block: LessonBlockDto;
};

export function LessonPictureMatchGame({ block }: Props) {
  const pairs = lessonPictureMatchPairs(block);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  if (pairs.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">Add picture pairs in the lesson editor.</p>;
  }

  const current = pairs[index]!;
  const done = index >= pairs.length;

  const check = () => {
    const ok = answer.trim().toLowerCase() === current.word.toLowerCase();
    setFeedback(ok ? "correct" : "wrong");
    if (ok) {
      window.setTimeout(() => {
        setAnswer("");
        setFeedback(null);
        setIndex((i) => i + 1);
      }, 700);
    }
  };

  if (done) {
    return <p className="lesson-game-panel__success">All pictures matched!</p>;
  }

  return (
    <div className="lesson-game-panel">
      <p className="text-sm text-[var(--color-muted)]">
        Picture {index + 1} of {pairs.length}
      </p>
      <figure className="lesson-image-figure">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.imageUrl} alt="Match this word" className="lesson-image-figure__img" />
      </figure>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type the word"
          className="min-w-[12rem] flex-1 border border-[var(--color-border)] px-3 py-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") check();
          }}
        />
        <button type="button" className="lesson-big-button !min-h-0 !w-auto !px-4 !py-2" onClick={check}>
          Check
        </button>
      </div>
      {feedback === "correct" ? <p className="lesson-game-panel__success">Correct!</p> : null}
      {feedback === "wrong" ? <p className="lesson-game-panel__fail">Try again.</p> : null}
    </div>
  );
}
