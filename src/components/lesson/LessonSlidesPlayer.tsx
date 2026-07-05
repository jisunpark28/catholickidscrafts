"use client";

import {
  lessonSlidesAssetIsPdf,
  lessonSlidesAssetIsPptx,
  lessonSlidesAssetUrl,
  lessonSlidesConfigured,
  lessonSlidesEmbedSrc,
  lessonSlidesOpenLabel,
} from "@/lib/lesson-kit/slides-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";

type Props = {
  block: LessonBlockDto;
  variant?: "default" | "classroom";
};

export function LessonSlidesPlayer({ block, variant = "default" }: Props) {
  if (!lessonSlidesConfigured(block)) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Slides not configured. Add a Google Slides link or upload a PDF in the lesson editor.
      </p>
    );
  }

  const embedSrc = lessonSlidesEmbedSrc(block);
  const frameClass =
    variant === "classroom"
      ? "lesson-slides-embed__frame lesson-slides-embed__frame--classroom"
      : "lesson-slides-embed__frame";

  if (embedSrc) {
    return (
      <div
        className={`lesson-slides-embed${variant === "classroom" ? " lesson-slides-embed--classroom" : ""}`}
      >
        <iframe
          title={lessonSlidesOpenLabel(block)}
          src={embedSrc}
          className={frameClass}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
        {variant === "default" ? (
          <p className="lesson-slides-embed__hint text-xs text-[var(--color-muted)]">
            Google Slides / Drive preview. Use full screen on the projector if needed.
          </p>
        ) : null}
      </div>
    );
  }

  const assetUrl = lessonSlidesAssetUrl(block);
  if (!assetUrl) {
    return null;
  }

  if (lessonSlidesAssetIsPdf(block)) {
    return (
      <div
        className={`lesson-slides-embed${variant === "classroom" ? " lesson-slides-embed--classroom" : ""}`}
      >
        <iframe title={lessonSlidesOpenLabel(block)} src={assetUrl} className={frameClass} />
        {variant === "default" ? (
          <p className="lesson-slides-embed__hint text-xs text-[var(--color-muted)]">
            PDF slides.{" "}
            <a
              href={assetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--color-link)]"
            >
              Open in new tab
            </a>
          </p>
        ) : null}
      </div>
    );
  }

  if (lessonSlidesAssetIsPptx(block)) {
    return (
      <div className="lesson-note text-center">
        <p className="text-sm text-[var(--color-muted)]">
          PowerPoint files cannot play in the browser. Export to PDF for inline view, or share the
          download link below.
        </p>
        <a
          href={assetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="lesson-big-button mt-4 inline-flex no-underline"
          download
        >
          {lessonSlidesOpenLabel(block)}
        </a>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-4">
      <a
        href={assetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="lesson-big-button inline-flex no-underline"
      >
        {lessonSlidesOpenLabel(block)}
      </a>
    </div>
  );
}
