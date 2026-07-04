import { LessonGamePrintSummary } from "@/components/lesson/LessonGamePrintSummary";
import { LessonImageFigure } from "@/components/lesson/LessonImageFigure";
import { blockDisplayLabel } from "@/lib/lesson-kit/family-blocks";
import { lessonImageSrc } from "@/lib/lesson-kit/image-block";
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
import {
  lessonWritingPrintBlankLines,
  lessonWritingMode,
  lessonWritingPrompt,
} from "@/lib/lesson-kit/writing-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";

type Props = {
  block: LessonBlockDto;
  stepNumber: number;
};

export function LessonPrintBlock({ block, stepNumber }: Props) {
  const minutes = estimateBlockPrintMinutes(block);

  return (
    <article className="lesson-print__step">
      <header className="lesson-print__step-header">
        <div className="lesson-print__step-heading">
          <p className="lesson-print__step-num">Step {stepNumber}</p>
          <h2 className="lesson-print__step-title">{blockDisplayLabel(block)}</h2>
        </div>
        <div className="lesson-print__step-badges">
          <span className="lesson-print__badge">{blockPrintTypeLabel(block)}</span>
          <span className="lesson-print__badge lesson-print__badge--muted">~{minutes} min</span>
        </div>
      </header>

      <div className={`lesson-print__step-body lesson-print__step-body--${block.type.toLowerCase()}`}>
        <LessonPrintBlockBody block={block} />
        {block.config.familyInclude === false ? (
          <p className="lesson-print__hint lesson-print__hint--class-only">
            Classroom only (hidden at home)
          </p>
        ) : null}
      </div>
    </article>
  );
}

function LessonPrintBlockBody({ block }: { block: LessonBlockDto }) {
  switch (block.type) {
    case "CUSTOM_NOTE":
      return block.config.html ? (
        <section className="lesson-print__section" aria-label="Teacher note">
          <h3 className="lesson-print__section-title">Teacher script</h3>
          <div
            className="lesson-print__note rich-content"
            dangerouslySetInnerHTML={{ __html: block.config.html }}
          />
        </section>
      ) : (
        <p className="lesson-print__hint">(no teacher note)</p>
      );
    case "LINK":
      return <LessonPrintLinkSection block={block} />;
    case "WRITING":
      return <LessonPrintWritingSection block={block} />;
    case "IMAGE":
      return <LessonPrintImageSection block={block} />;
    case "SLIDES":
      return <LessonPrintSlidesSection block={block} />;
    case "GAME":
      return (
        <section className="lesson-print__section" aria-label="Game">
          <h3 className="lesson-print__section-title">Game</h3>
          <LessonGamePrintSummary block={block} />
        </section>
      );
    case "PLAY_GAME":
      return (
        <section className="lesson-print__section" aria-label="Site game">
          <h3 className="lesson-print__section-title">Site game</h3>
          <p className="lesson-print__body-text">{playGamePrintLabel(block)}</p>
          <p className="lesson-print__hint">Run on screen: /play/{block.config.gameSlug ?? "liturgical-vestments"}</p>
        </section>
      );
    case "TYPING_WORDS":
      return (
        <section className="lesson-print__section" aria-label="Typing words">
          <h3 className="lesson-print__section-title">Word list</h3>
          <p className="lesson-print__body-text">{typingWordsPrintLabel(block)}</p>
        </section>
      );
    case "HANGMAN_WORDS":
      return (
        <section className="lesson-print__section" aria-label="Hangman">
          <h3 className="lesson-print__section-title">Hangman</h3>
          <p className="lesson-print__body-text">Site hangman game (preset words)</p>
        </section>
      );
    case "RESOURCE":
      return (
        <section className="lesson-print__section" aria-label="Craft">
          <h3 className="lesson-print__section-title">Activity</h3>
          <p className="lesson-print__body-text">{resourcePrintLabel(block)}</p>
          {block.config.resourceSlug ? (
            <p className="lesson-print__link-url">/resources/{block.config.resourceSlug}</p>
          ) : null}
        </section>
      );
    case "GOSPEL_TYPING":
      return (
        <section className="lesson-print__section" aria-label="Gospel">
          <h3 className="lesson-print__section-title">Gospel typing</h3>
          <p className="lesson-print__body-text">
            Reading: {block.config.readingKind ?? "gospel"}
            {block.config.maxChars ? ` · up to ${block.config.maxChars} characters` : ""}
          </p>
        </section>
      );
    case "BIBLE_CHAPTER":
      return (
        <section className="lesson-print__section" aria-label="Bible chapter">
          <h3 className="lesson-print__section-title">Bible chapter</h3>
          <p className="lesson-print__body-text">
            {block.config.bookSlug ?? "matthew"} {block.config.chapter ?? 1}
            {block.config.maxChars ? ` · up to ${block.config.maxChars} characters` : ""}
          </p>
        </section>
      );
    case "MASS_TODAY":
      return (
        <section className="lesson-print__section" aria-label="Mass today">
          <h3 className="lesson-print__section-title">Today&apos;s Mass</h3>
          <p className="lesson-print__body-text">Daily readings and calendar on screen</p>
        </section>
      );
    default:
      return <p className="lesson-print__hint">(unsupported step type)</p>;
  }
}

function LessonPrintLinkSection({ block }: { block: LessonBlockDto }) {
  const href = lessonLinkHref(block);
  const label = lessonLinkButtonLabel(block);
  const asset = block.config.assetUrl?.trim();

  if (!href && !asset) {
    return <p className="lesson-print__hint">(link not configured)</p>;
  }

  return (
    <section className="lesson-print__section lesson-print__section--link" aria-label="Link">
      <h3 className="lesson-print__section-title">Open in browser</h3>
      {href ? (
        <div className="lesson-print__link-card">
          <p className="lesson-print__link-label">{label}</p>
          <p className="lesson-print__link-url">{href}</p>
        </div>
      ) : null}
      {asset ? (
        <div className="lesson-print__link-card">
          <p className="lesson-print__link-label">Attached file</p>
          <p className="lesson-print__link-url">{asset}</p>
        </div>
      ) : null}
    </section>
  );
}

function LessonPrintWritingSection({ block }: { block: LessonBlockDto }) {
  const prompt = lessonWritingPrompt(block);
  if (!prompt) {
    return <p className="lesson-print__hint">(writing prompt not set)</p>;
  }

  const mode = lessonWritingMode(block);
  const blankLines = lessonWritingPrintBlankLines(block);

  return (
    <section className="lesson-print__section lesson-print__section--writing" aria-label="Writing">
      <h3 className="lesson-print__section-title">
        {mode === "display" ? "Discussion prompt" : "Student writing"}
      </h3>
      <p className="lesson-print__writing-prompt">{prompt}</p>
      {mode === "student" ? (
        <div className="lesson-print__writing-lines" aria-hidden>
          {Array.from({ length: blankLines }).map((_, line) => (
            <div key={line} className="lesson-print__writing-line" />
          ))}
        </div>
      ) : (
        <p className="lesson-print__hint">Display only — no written response on the worksheet.</p>
      )}
    </section>
  );
}

function LessonPrintImageSection({ block }: { block: LessonBlockDto }) {
  if (!lessonImageSrc(block)) {
    return <p className="lesson-print__hint">(image not configured)</p>;
  }

  return (
    <section className="lesson-print__section lesson-print__section--image" aria-label="Image">
      <h3 className="lesson-print__section-title">Picture</h3>
      <div className="lesson-print__image">
        <LessonImageFigure block={block} />
      </div>
    </section>
  );
}

function LessonPrintSlidesSection({ block }: { block: LessonBlockDto }) {
  const embed = lessonSlidesEmbedSrc(block);
  const asset = lessonSlidesAssetUrl(block);
  const label = lessonSlidesOpenLabel(block);

  if (!embed && !asset) {
    return <p className="lesson-print__hint">(slides not configured)</p>;
  }

  const source = lessonSlidesSource(block);
  const assetKind = lessonSlidesAssetIsPdf(block)
    ? "PDF"
    : lessonSlidesAssetIsPptx(block)
      ? "PowerPoint"
      : "File";

  return (
    <section className="lesson-print__section lesson-print__section--slides" aria-label="Slides">
      <h3 className="lesson-print__section-title">Slides</h3>
      <p className="lesson-print__body-text">{label}</p>
      {source === "embed" && embed ? (
        <div className="lesson-print__link-card">
          <p className="lesson-print__link-label">Google Slides embed</p>
          <p className="lesson-print__link-url">{embed}</p>
        </div>
      ) : null}
      {source === "upload" && asset ? (
        <div className="lesson-print__link-card">
          <p className="lesson-print__link-label">Uploaded {assetKind}</p>
          <p className="lesson-print__link-url">{asset}</p>
          {block.config.assetFilename ? (
            <p className="lesson-print__hint">{block.config.assetFilename}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
