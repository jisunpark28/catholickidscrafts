"use client";

import {
  defaultGameConfig,
  LESSON_GAME_FORMATS,
  lessonFillBlankAnswers,
  lessonFillBlankText,
  lessonGameFormat,
  lessonGameHint,
  lessonGamePassage,
  lessonGameWords,
  lessonMultipleChoiceItems,
  lessonPictureMatchPairs,
  lessonTrueFalseItems,
  lessonTypingMode,
  parseWordList,
  type LessonGameFormat,
  type MultipleChoiceItem,
  type PictureMatchPair,
  type TrueFalseItem,
} from "@/lib/lesson-kit/game-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";

type Props = {
  block: LessonBlockDto;
  patch: (partial: Partial<LessonBlockDto["config"]>) => void;
};

function wordsTextareaValue(words: string[]): string {
  return words.join("\n");
}

export function LessonGameConfigFields({ block, patch }: Props) {
  const format = lessonGameFormat(block);

  const setFormat = (next: LessonGameFormat) => {
    patch(defaultGameConfig(next));
  };

  return (
    <>
      <label className="lesson-block-config__field">
        <span>Game format</span>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as LessonGameFormat)}
        >
          {LESSON_GAME_FORMATS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      {format === "hangman" ? (
        <>
          <label className="lesson-block-config__field">
            <span>Words (one per line or comma-separated)</span>
            <textarea
              rows={5}
              value={wordsTextareaValue(lessonGameWords(block))}
              onChange={(e) => patch({ gameWords: parseWordList(e.target.value) })}
            />
          </label>
          <label className="lesson-block-config__field">
            <span>Hint (optional)</span>
            <input
              type="text"
              value={lessonGameHint(block)}
              onChange={(e) => patch({ gameHint: e.target.value })}
            />
          </label>
        </>
      ) : null}

      {format === "typing" ? (
        <>
          <fieldset className="lesson-block-config__field">
            <legend className="text-sm font-semibold text-[var(--color-ink)]">Typing mode</legend>
            <div className="mt-2 flex gap-2">
              {(
                [
                  { value: "words" as const, label: "Word list" },
                  { value: "passage" as const, label: "Passage" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`cursor-pointer rounded border px-3 py-2 text-xs font-semibold ${
                    lessonTypingMode(block) === opt.value
                      ? "border-[var(--color-accent)] bg-white"
                      : "border-[var(--color-border)] text-[var(--color-muted)]"
                  }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    checked={lessonTypingMode(block) === opt.value}
                    onChange={() => patch({ typingMode: opt.value })}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>
          {lessonTypingMode(block) === "words" ? (
            <label className="lesson-block-config__field">
              <span>Words</span>
              <textarea
                rows={5}
                value={wordsTextareaValue(lessonGameWords(block))}
                onChange={(e) => patch({ gameWords: parseWordList(e.target.value) })}
              />
            </label>
          ) : (
            <label className="lesson-block-config__field">
              <span>Passage text</span>
              <textarea
                rows={6}
                value={lessonGamePassage(block)}
                onChange={(e) => patch({ gamePassage: e.target.value })}
              />
            </label>
          )}
        </>
      ) : null}

      {format === "picture_match" ? (
        <PictureMatchEditor
          pairs={lessonPictureMatchPairs(block)}
          onChange={(pictureMatch) => patch({ pictureMatch })}
        />
      ) : null}

      {format === "fill_blank" ? (
        <>
          <label className="lesson-block-config__field">
            <span>Sentence (use ___ for each blank)</span>
            <textarea
              rows={3}
              value={lessonFillBlankText(block)}
              onChange={(e) => patch({ fillBlankText: e.target.value })}
            />
          </label>
          <label className="lesson-block-config__field">
            <span>Answers (one per line, in blank order)</span>
            <textarea
              rows={3}
              value={lessonFillBlankAnswers(block).join("\n")}
              onChange={(e) =>
                patch({
                  fillBlankAnswers: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
        </>
      ) : null}

      {format === "true_false" ? (
        <TrueFalseEditor
          items={lessonTrueFalseItems(block)}
          onChange={(trueFalseItems) => patch({ trueFalseItems })}
        />
      ) : null}

      {format === "multiple_choice" ? (
        <MultipleChoiceEditor
          items={lessonMultipleChoiceItems(block)}
          onChange={(multipleChoiceItems) => patch({ multipleChoiceItems })}
        />
      ) : null}

      {format === "true_false" || format === "multiple_choice" || format === "fill_blank" ? (
        <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
          <input
            type="checkbox"
            checked={block.config.printAnswerKey !== false}
            onChange={(e) => patch({ printAnswerKey: e.target.checked })}
          />
          Include answer key on print view
        </label>
      ) : null}
    </>
  );
}

function PictureMatchEditor({
  pairs,
  onChange,
}: {
  pairs: PictureMatchPair[];
  onChange: (pairs: PictureMatchPair[]) => void;
}) {
  const rows = pairs.length > 0 ? pairs : [{ imageUrl: "", word: "" }];

  return (
    <div className="lesson-block-config__field space-y-3">
      <span className="text-sm font-semibold text-[var(--color-ink)]">Picture pairs</span>
      {rows.map((pair, i) => (
        <div key={i} className="grid gap-2 rounded border border-[var(--color-border)] p-3 sm:grid-cols-2">
          <input
            type="url"
            placeholder="Image URL"
            value={pair.imageUrl}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...pair, imageUrl: e.target.value };
              onChange(next);
            }}
          />
          <input
            type="text"
            placeholder="Word"
            value={pair.word}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...pair, word: e.target.value };
              onChange(next);
            }}
          />
        </div>
      ))}
      <button
        type="button"
        className="text-sm font-semibold text-[var(--color-link)]"
        onClick={() => onChange([...rows, { imageUrl: "", word: "" }])}
      >
        + Add pair
      </button>
    </div>
  );
}

function TrueFalseEditor({
  items,
  onChange,
}: {
  items: TrueFalseItem[];
  onChange: (items: TrueFalseItem[]) => void;
}) {
  const rows = items.length > 0 ? items : [{ statement: "", answer: true }];

  return (
    <div className="lesson-block-config__field space-y-3">
      <span className="text-sm font-semibold text-[var(--color-ink)]">Statements</span>
      {rows.map((item, i) => (
        <div key={i} className="space-y-2 rounded border border-[var(--color-border)] p-3">
          <input
            type="text"
            placeholder="Statement"
            value={item.statement}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...item, statement: e.target.value };
              onChange(next);
            }}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={item.answer}
              onChange={(e) => {
                const next = [...rows];
                next[i] = { ...item, answer: e.target.checked };
                onChange(next);
              }}
            />
            Answer is True
          </label>
        </div>
      ))}
      <button
        type="button"
        className="text-sm font-semibold text-[var(--color-link)]"
        onClick={() => onChange([...rows, { statement: "", answer: true }])}
      >
        + Add statement
      </button>
    </div>
  );
}

function MultipleChoiceEditor({
  items,
  onChange,
}: {
  items: MultipleChoiceItem[];
  onChange: (items: MultipleChoiceItem[]) => void;
}) {
  const rows =
    items.length > 0 ? items : [{ question: "", choices: ["", "", "", ""], correctIndex: 0 }];

  return (
    <div className="lesson-block-config__field space-y-3">
      <span className="text-sm font-semibold text-[var(--color-ink)]">Questions</span>
      {rows.map((item, i) => (
        <div key={i} className="space-y-2 rounded border border-[var(--color-border)] p-3">
          <input
            type="text"
            placeholder="Question"
            value={item.question}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...item, question: e.target.value };
              onChange(next);
            }}
          />
          {item.choices.map((choice, ci) => (
            <div key={ci} className="flex items-center gap-2">
              <input
                type="radio"
                name={`mc-correct-${i}`}
                checked={item.correctIndex === ci}
                onChange={() => {
                  const next = [...rows];
                  next[i] = { ...item, correctIndex: ci };
                  onChange(next);
                }}
              />
              <input
                type="text"
                className="flex-1"
                placeholder={`Choice ${ci + 1}`}
                value={choice}
                onChange={(e) => {
                  const next = [...rows];
                  const choices = [...item.choices];
                  choices[ci] = e.target.value;
                  next[i] = { ...item, choices };
                  onChange(next);
                }}
              />
            </div>
          ))}
        </div>
      ))}
      <button
        type="button"
        className="text-sm font-semibold text-[var(--color-link)]"
        onClick={() =>
          onChange([...rows, { question: "", choices: ["", "", "", ""], correctIndex: 0 }])
        }
      >
        + Add question
      </button>
    </div>
  );
}
