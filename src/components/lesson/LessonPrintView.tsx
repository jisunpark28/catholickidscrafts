import { LessonPrintBlock } from "@/components/lesson/LessonPrintBlock";
import { lessonPrintMetaRows } from "@/lib/lesson-kit/print-block";
import type { LessonKitDto } from "@/lib/lesson-kit/types";

type Props = {
  kit: LessonKitDto;
};

export function LessonPrintView({ kit }: Props) {
  const metaRows = lessonPrintMetaRows(kit);

  return (
    <div className="lesson-print">
      <header className="lesson-print__cover">
        <p className="lesson-print__brand">Catholic Kids Crafts · Class lesson plan</p>
        <h1 className="lesson-print__title">{kit.title}</h1>
        {kit.description ? <p className="lesson-print__description">{kit.description}</p> : null}
        <dl className="lesson-print__meta-grid">
          {metaRows.map((row) => (
            <div key={row.label} className="lesson-print__meta-item">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="lesson-print__run-links">
          Classroom: <span className="lesson-print__mono">/lesson/{kit.shareSlug}</span>
          {" · "}
          At home: <span className="lesson-print__mono">/lesson/{kit.shareSlug}/family</span>
        </p>
      </header>

      <div className="lesson-print__steps">
        {kit.blocks.map((block, i) => (
          <LessonPrintBlock key={block.id} block={block} stepNumber={i + 1} />
        ))}
      </div>

      <footer className="lesson-print__footer">
        Printed from Catholic Kids Crafts · {kit.title}
      </footer>
    </div>
  );
}
