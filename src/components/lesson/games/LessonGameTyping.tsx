"use client";

import { PassageTypingGame } from "@/components/PassageTypingGame";
import { WordFallTypingGame } from "@/components/WordFallTypingGame";
import {
  lessonGamePassage,
  lessonGameWords,
  lessonTypingMode,
} from "@/lib/lesson-kit/game-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";

type Props = {
  block: LessonBlockDto;
};

export function LessonGameTyping({ block }: Props) {
  const mode = lessonTypingMode(block);

  if (mode === "passage") {
    const passage = lessonGamePassage(block);
    if (!passage) {
      return <p className="text-sm text-[var(--color-muted)]">Add a passage in the lesson editor.</p>;
    }
    return (
      <PassageTypingGame
        text={passage}
        hideInstructions
        embedded
        celebrateOnComplete
        showSaveButton={false}
      />
    );
  }

  const words = lessonGameWords(block);
  if (words.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">Add words in the lesson editor.</p>;
  }
  return <WordFallTypingGame wordFilter={words} compact />;
}
