"use client";

import { LessonFillBlankGame } from "@/components/lesson/games/LessonFillBlankGame";
import { LessonGameTyping } from "@/components/lesson/games/LessonGameTyping";
import { LessonHangmanGame } from "@/components/lesson/games/LessonHangmanGame";
import { LessonMultipleChoiceGame } from "@/components/lesson/games/LessonMultipleChoiceGame";
import { LessonPictureMatchGame } from "@/components/lesson/games/LessonPictureMatchGame";
import { LessonTrueFalseGame } from "@/components/lesson/games/LessonTrueFalseGame";
import { lessonGameFormat } from "@/lib/lesson-kit/game-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";

type Props = {
  block: LessonBlockDto;
};

export function LessonGamePlayer({ block }: Props) {
  switch (lessonGameFormat(block)) {
    case "hangman":
      return <LessonHangmanGame block={block} />;
    case "typing":
      return <LessonGameTyping block={block} />;
    case "picture_match":
      return <LessonPictureMatchGame block={block} />;
    case "fill_blank":
      return <LessonFillBlankGame block={block} />;
    case "true_false":
      return <LessonTrueFalseGame block={block} />;
    case "multiple_choice":
      return <LessonMultipleChoiceGame block={block} />;
    default:
      return <p className="text-sm text-[var(--color-muted)]">Unknown game format.</p>;
  }
}
