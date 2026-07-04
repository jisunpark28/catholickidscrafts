import {
  lessonImageAlt,
  lessonImageCaption,
  lessonImageSrc,
} from "@/lib/lesson-kit/image-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";

type Props = {
  block: LessonBlockDto;
};

export function LessonImageFigure({ block }: Props) {
  const src = lessonImageSrc(block);
  if (!src) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        No image configured. Upload a picture or add an image URL in the lesson editor.
      </p>
    );
  }

  const caption = lessonImageCaption(block);

  return (
    <figure className="lesson-image-figure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={lessonImageAlt(block)} className="lesson-image-figure__img" />
      {caption ? <figcaption className="lesson-image-figure__caption">{caption}</figcaption> : null}
    </figure>
  );
}
