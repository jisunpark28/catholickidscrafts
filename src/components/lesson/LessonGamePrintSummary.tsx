import {
  gameFormatSummary,
  lessonFillBlankAnswers,
  lessonFillBlankText,
  lessonGameFormat,
  lessonGameHint,
  lessonGamePassage,
  lessonGamePrintAnswerKey,
  lessonGameWords,
  lessonMultipleChoiceItems,
  lessonPictureMatchPairs,
  lessonTrueFalseItems,
  lessonTypingMode,
} from "@/lib/lesson-kit/game-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";

type Props = {
  block: LessonBlockDto;
};

export function LessonGamePrintSummary({ block }: Props) {
  const format = lessonGameFormat(block);
  const showKey = lessonGamePrintAnswerKey(block);

  return (
    <div className="lesson-print__game">
      <p className="lesson-print__game-summary">{gameFormatSummary(block)}</p>
      {format === "hangman" && showKey ? (
        <p className="lesson-print__hint">Words: {lessonGameWords(block).join(", ")}</p>
      ) : null}
      {format === "hangman" && lessonGameHint(block) ? (
        <p className="lesson-print__hint">Hint: {lessonGameHint(block)}</p>
      ) : null}
      {format === "typing" && lessonTypingMode(block) === "passage" && showKey ? (
        <p className="lesson-print__note whitespace-pre-wrap">{lessonGamePassage(block)}</p>
      ) : null}
      {format === "typing" && lessonTypingMode(block) === "words" && showKey ? (
        <p className="lesson-print__hint">Words: {lessonGameWords(block).join(", ")}</p>
      ) : null}
      {format === "picture_match" && showKey ? (
        <ul className="lesson-print__game-answers">
          {lessonPictureMatchPairs(block).map((p, i) => (
            <li key={`${i}-${p.word}`}>
              {p.word} — {p.imageUrl}
            </li>
          ))}
        </ul>
      ) : null}
      {format === "fill_blank" && showKey ? (
        <>
          <p className="lesson-print__note">{lessonFillBlankText(block)}</p>
          <p className="lesson-print__hint">
            Answers: {lessonFillBlankAnswers(block).join(" · ")}
          </p>
        </>
      ) : null}
      {format === "true_false" && showKey ? (
        <ul className="lesson-print__game-answers">
          {lessonTrueFalseItems(block).map((item, i) => (
            <li key={`${i}-${item.statement}`}>
              {item.statement} — <strong>{item.answer ? "True" : "False"}</strong>
            </li>
          ))}
        </ul>
      ) : null}
      {format === "multiple_choice" && showKey ? (
        <ul className="lesson-print__game-answers">
          {lessonMultipleChoiceItems(block).map((item, i) => (
            <li key={`${i}-${item.question}`}>
              {item.question} — <strong>{item.choices[item.correctIndex]}</strong>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
