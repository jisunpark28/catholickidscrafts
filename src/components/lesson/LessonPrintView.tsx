import { blockDisplayLabel } from "@/lib/lesson-kit/family-blocks";
import { LessonImageFigure } from "@/components/lesson/LessonImageFigure";
import { lessonImageSrc } from "@/lib/lesson-kit/image-block";
import {
  lessonSlidesAssetUrl,
  lessonSlidesEmbedSrc,
} from "@/lib/lesson-kit/slides-block";
import { lessonLinkHref } from "@/lib/lesson-kit/link-block";
import {
  lessonWritingPrintBlankLines,
  lessonWritingPrompt,
} from "@/lib/lesson-kit/writing-block";
import type { LessonKitDto } from "@/lib/lesson-kit/types";
import { LESSON_BLOCK_DEFAULT_LABEL } from "@/lib/lesson-kit/constants";
import "@/styles/lesson-kit.css";
import "@/styles/lesson-print.css";

type Props = {
  kit: LessonKitDto;
};

export function LessonPrintView({ kit }: Props) {
  return (
    <div className="lesson-print">
      <header className="lesson-print__header">
        <h1>{kit.title}</h1>
        {kit.description ? <p>{kit.description}</p> : null}
        <p className="lesson-print__meta">
          {kit.stepCount} steps · Classroom: /lesson/{kit.shareSlug} · At home: /lesson/{kit.shareSlug}/family
        </p>
      </header>
      <ol className="lesson-print__steps">
        {kit.blocks.map((block, i) => (
          <li key={block.id}>
            <strong>
              {i + 1}. {blockDisplayLabel(block)}
            </strong>
            <span className="lesson-print__type"> ({LESSON_BLOCK_DEFAULT_LABEL[block.type]})</span>
            {block.type === "CUSTOM_NOTE" && block.config.html ? (
              <div
                className="lesson-print__note rich-content"
                dangerouslySetInnerHTML={{ __html: block.config.html }}
              />
            ) : null}
            {block.type === "LINK" ? (
              <>
                {lessonLinkHref(block) ? (
                  <p className="lesson-print__link">{lessonLinkHref(block)}</p>
                ) : null}
                {block.config.assetUrl?.trim() ? (
                  <p className="lesson-print__link">{block.config.assetUrl.trim()}</p>
                ) : null}
              </>
            ) : null}
            {block.type === "WRITING" && lessonWritingPrompt(block) ? (
              <div className="lesson-print__writing">
                <p className="lesson-print__writing-prompt">{lessonWritingPrompt(block)}</p>
                <div className="lesson-print__writing-lines" aria-hidden>
                  {Array.from({ length: lessonWritingPrintBlankLines(block) }).map((_, line) => (
                    <div key={line} className="lesson-print__writing-line" />
                  ))}
                </div>
              </div>
            ) : null}
            {block.type === "IMAGE" && lessonImageSrc(block) ? (
              <div className="lesson-print__image">
                <LessonImageFigure block={block} />
              </div>
            ) : null}
            {block.type === "SLIDES" ? (
              <div className="lesson-print__slides">
                {lessonSlidesEmbedSrc(block) ? (
                  <p className="lesson-print__link">{lessonSlidesEmbedSrc(block)}</p>
                ) : null}
                {lessonSlidesAssetUrl(block) ? (
                  <p className="lesson-print__link">{lessonSlidesAssetUrl(block)}</p>
                ) : null}
                {!lessonSlidesEmbedSrc(block) && !lessonSlidesAssetUrl(block) ? (
                  <p className="lesson-print__hint">(slides not configured)</p>
                ) : null}
              </div>
            ) : null}
            {block.config.familyInclude === false ? (
              <p className="lesson-print__hint">Classroom only (hidden at home)</p>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="lesson-print__footer">Catholic Kids Crafts — Class lessons</p>
    </div>
  );
}
