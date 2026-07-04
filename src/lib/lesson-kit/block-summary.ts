import { LESSON_BLOCK_DEFAULT_LABEL, LESSON_GAME_SLUGS, LESSON_RESOURCE_SLUGS, LESSON_WORD_PRESETS } from "@/lib/lesson-kit/constants";
import { blockDisplayLabel } from "@/lib/lesson-kit/family-blocks";
import { lessonLinkButtonLabel, lessonLinkHref } from "@/lib/lesson-kit/link-block";
import { lessonWritingPrompt } from "@/lib/lesson-kit/writing-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";

function clip(text: string, max = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function htmlToPlainPreview(html: string): string {
  return clip(
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    100,
  );
}

/** One-line public summary for a lesson block (community detail). */
export function lessonBlockSummaryLine(block: LessonBlockDto): string {
  const label = blockDisplayLabel(block);
  const typeLabel = LESSON_BLOCK_DEFAULT_LABEL[block.type];

  switch (block.type) {
    case "CUSTOM_NOTE": {
      const html = block.config.html;
      if (typeof html === "string" && html.trim()) {
        return clip(`${typeLabel}: ${htmlToPlainPreview(html)}`, 140);
      }
      return typeLabel;
    }
    case "WRITING": {
      const prompt = lessonWritingPrompt(block);
      return prompt ? clip(prompt, 140) : typeLabel;
    }
    case "LINK": {
      const linkLabel = lessonLinkButtonLabel(block);
      const href = lessonLinkHref(block);
      return href ? `${linkLabel} → ${clip(href, 80)}` : typeLabel;
    }
    case "IMAGE":
      return block.config.caption?.trim() || block.config.alt?.trim() || typeLabel;
    case "SLIDES":
      return block.config.buttonLabel?.trim() || block.label?.trim() || typeLabel;
    case "PLAY_GAME": {
      const slug = block.config.gameSlug ?? "liturgical-vestments";
      const game = LESSON_GAME_SLUGS.find((g) => g.slug === slug);
      return game ? `${typeLabel}: ${game.label}` : typeLabel;
    }
    case "TYPING_WORDS": {
      const preset = block.config.wordPreset ?? "sunday";
      return `${typeLabel}: ${LESSON_WORD_PRESETS[preset]?.label ?? preset}`;
    }
    case "HANGMAN_WORDS":
      return `${typeLabel}: Hangman`;
    case "RESOURCE": {
      const slug = block.config.resourceSlug ?? "";
      const resource = LESSON_RESOURCE_SLUGS.find((r) => r.slug === slug);
      return resource ? `${typeLabel}: ${resource.label}` : typeLabel;
    }
    case "GOSPEL_TYPING":
      return `${typeLabel}: ${block.config.readingKind ?? "gospel"}`;
    case "BIBLE_CHAPTER":
      return `${typeLabel}: ${block.config.bookSlug ?? "matthew"} ${block.config.chapter ?? 1}`;
    case "MASS_TODAY":
      return typeLabel;
    default:
      return label !== typeLabel ? `${typeLabel} · ${label}` : typeLabel;
  }
}
