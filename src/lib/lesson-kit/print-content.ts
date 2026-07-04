import { blockDisplayLabel } from "@/lib/lesson-kit/family-blocks";
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
import {
  lessonImageAlt,
  lessonImageCaption,
  lessonImageSrc,
} from "@/lib/lesson-kit/image-block";
import { lessonLinkButtonLabel, lessonLinkHref } from "@/lib/lesson-kit/link-block";
import {
  blockPrintTypeLabel,
  estimateBlockPrintMinutes,
  playGamePrintLabel,
  resourcePrintLabel,
  typingWordsPrintLabel,
} from "@/lib/lesson-kit/print-block";
import {
  lessonSlidesAssetIsPdf,
  lessonSlidesAssetIsPptx,
  lessonSlidesAssetUrl,
  lessonSlidesEmbedSrc,
  lessonSlidesOpenLabel,
  lessonSlidesSource,
} from "@/lib/lesson-kit/slides-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";
import {
  lessonWritingPrintBlankLines,
  lessonWritingMode,
  lessonWritingPrompt,
} from "@/lib/lesson-kit/writing-block";

export type PrintContentLine =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "hint"; text: string }
  | { kind: "blank-line" };

export function lessonStepHeaderLines(block: LessonBlockDto, stepNumber: number): PrintContentLine[] {
  const minutes = estimateBlockPrintMinutes(block);
  return [
    { kind: "heading", level: 2, text: `Step ${stepNumber}: ${blockDisplayLabel(block)}` },
    {
      kind: "paragraph",
      text: `${blockPrintTypeLabel(block)} · ~${minutes} min`,
    },
  ];
}

export function lessonBlockPrintContentLines(block: LessonBlockDto): PrintContentLine[] {
  const lines: PrintContentLine[] = [];

  const pushSection = (title: string, body: PrintContentLine[]) => {
    lines.push({ kind: "heading", level: 3, text: title });
    lines.push(...body);
  };

  switch (block.type) {
    case "CUSTOM_NOTE": {
      if (block.config.html?.trim()) {
        pushSection("Teacher script", htmlToPrintLines(block.config.html));
      } else {
        lines.push({ kind: "hint", text: "(no teacher note)" });
      }
      break;
    }
    case "LINK": {
      const href = lessonLinkHref(block);
      const label = lessonLinkButtonLabel(block);
      const asset = block.config.assetUrl?.trim();
      if (!href && !asset) {
        lines.push({ kind: "hint", text: "(link not configured)" });
        break;
      }
      pushSection("Open in browser", [
        ...(href
          ? [
              { kind: "paragraph" as const, text: label },
              { kind: "paragraph" as const, text: href },
            ]
          : []),
        ...(asset
          ? [
              { kind: "paragraph" as const, text: "Attached file" },
              { kind: "paragraph" as const, text: asset },
            ]
          : []),
      ]);
      break;
    }
    case "WRITING": {
      const prompt = lessonWritingPrompt(block);
      if (!prompt) {
        lines.push({ kind: "hint", text: "(writing prompt not set)" });
        break;
      }
      const mode = lessonWritingMode(block);
      pushSection(mode === "display" ? "Discussion prompt" : "Student writing", [
        { kind: "paragraph", text: prompt },
        ...(mode === "student"
          ? Array.from({ length: lessonWritingPrintBlankLines(block) }).flatMap(() => [
              { kind: "blank-line" as const },
            ])
          : [{ kind: "hint" as const, text: "Display only — no written response on the worksheet." }]),
      ]);
      break;
    }
    case "IMAGE": {
      const src = lessonImageSrc(block);
      if (!src) {
        lines.push({ kind: "hint", text: "(image not configured)" });
        break;
      }
      const caption = lessonImageCaption(block);
      pushSection("Picture", [
        { kind: "paragraph", text: lessonImageAlt(block) },
        { kind: "paragraph", text: src },
        ...(caption ? [{ kind: "paragraph" as const, text: caption }] : []),
      ]);
      break;
    }
    case "SLIDES": {
      const embed = lessonSlidesEmbedSrc(block);
      const asset = lessonSlidesAssetUrl(block);
      const label = lessonSlidesOpenLabel(block);
      if (!embed && !asset) {
        lines.push({ kind: "hint", text: "(slides not configured)" });
        break;
      }
      const source = lessonSlidesSource(block);
      const assetKind = lessonSlidesAssetIsPdf(block)
        ? "PDF"
        : lessonSlidesAssetIsPptx(block)
          ? "PowerPoint"
          : "File";
      pushSection("Slides", [
        { kind: "paragraph", text: label },
        ...(source === "embed" && embed
          ? [
              { kind: "paragraph" as const, text: "Google Slides embed" },
              { kind: "paragraph" as const, text: embed },
            ]
          : []),
        ...(source === "upload" && asset
          ? [
              { kind: "paragraph" as const, text: `Uploaded ${assetKind}` },
              { kind: "paragraph" as const, text: asset },
              ...(block.config.assetFilename
                ? [{ kind: "hint" as const, text: block.config.assetFilename }]
                : []),
            ]
          : []),
      ]);
      break;
    }
    case "GAME":
      pushSection("Game", lessonGamePrintContentLines(block));
      break;
    case "PLAY_GAME":
      pushSection("Site game", [
        { kind: "paragraph", text: playGamePrintLabel(block) },
        {
          kind: "hint",
          text: `Run on screen: /play/${block.config.gameSlug ?? "liturgical-vestments"}`,
        },
      ]);
      break;
    case "TYPING_WORDS":
      pushSection("Word list", [{ kind: "paragraph", text: typingWordsPrintLabel(block) }]);
      break;
    case "HANGMAN_WORDS":
      pushSection("Hangman", [{ kind: "paragraph", text: "Site hangman game (preset words)" }]);
      break;
    case "RESOURCE":
      pushSection("Activity", [
        { kind: "paragraph", text: resourcePrintLabel(block) },
        ...(block.config.resourceSlug
          ? [{ kind: "paragraph" as const, text: `/resources/${block.config.resourceSlug}` }]
          : []),
      ]);
      break;
    case "GOSPEL_TYPING":
      pushSection("Gospel typing", [
        {
          kind: "paragraph",
          text: `Reading: ${block.config.readingKind ?? "gospel"}${block.config.maxChars ? ` · up to ${block.config.maxChars} characters` : ""}`,
        },
      ]);
      break;
    case "BIBLE_CHAPTER":
      pushSection("Bible chapter", [
        {
          kind: "paragraph",
          text: `${block.config.bookSlug ?? "matthew"} ${block.config.chapter ?? 1}${block.config.maxChars ? ` · up to ${block.config.maxChars} characters` : ""}`,
        },
      ]);
      break;
    case "MASS_TODAY":
      pushSection("Today's Mass", [
        { kind: "paragraph", text: "Daily readings and calendar on screen" },
      ]);
      break;
    default:
      lines.push({ kind: "hint", text: "(unsupported step type)" });
  }

  if (block.config.familyInclude === false) {
    lines.push({ kind: "hint", text: "Classroom only (hidden at home)" });
  }

  return lines;
}

function lessonGamePrintContentLines(block: LessonBlockDto): PrintContentLine[] {
  const format = lessonGameFormat(block);
  const showKey = lessonGamePrintAnswerKey(block);
  const lines: PrintContentLine[] = [{ kind: "paragraph", text: gameFormatSummary(block) }];

  if (format === "hangman" && showKey) {
    lines.push({ kind: "hint", text: `Words: ${lessonGameWords(block).join(", ")}` });
  }
  if (format === "hangman" && lessonGameHint(block)) {
    lines.push({ kind: "hint", text: `Hint: ${lessonGameHint(block)}` });
  }
  if (format === "typing" && lessonTypingMode(block) === "passage" && showKey) {
    lines.push({ kind: "paragraph", text: lessonGamePassage(block) });
  }
  if (format === "typing" && lessonTypingMode(block) === "words" && showKey) {
    lines.push({ kind: "hint", text: `Words: ${lessonGameWords(block).join(", ")}` });
  }
  if (format === "picture_match" && showKey) {
    for (const pair of lessonPictureMatchPairs(block)) {
      lines.push({ kind: "bullet", text: `${pair.word} — ${pair.imageUrl}` });
    }
  }
  if (format === "fill_blank" && showKey) {
    lines.push({ kind: "paragraph", text: lessonFillBlankText(block) });
    lines.push({
      kind: "hint",
      text: `Answers: ${lessonFillBlankAnswers(block).join(" · ")}`,
    });
  }
  if (format === "true_false" && showKey) {
    for (const item of lessonTrueFalseItems(block)) {
      lines.push({
        kind: "bullet",
        text: `${item.statement} — ${item.answer ? "True" : "False"}`,
      });
    }
  }
  if (format === "multiple_choice" && showKey) {
    for (const item of lessonMultipleChoiceItems(block)) {
      lines.push({
        kind: "bullet",
        text: `${item.question} — ${item.choices[item.correctIndex]}`,
      });
    }
  }

  return lines;
}

function htmlToPrintLines(html: string): PrintContentLine[] {
  const text = htmlToPlainText(html);
  if (!text) return [{ kind: "hint", text: "(empty note)" }];
  return text.split(/\n{2,}/).map((chunk) => ({
    kind: "paragraph" as const,
    text: chunk.trim(),
  }));
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
