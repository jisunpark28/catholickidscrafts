import { blockDisplayLabel } from "@/lib/lesson-kit/family-blocks";
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
