import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
};

export function LessonRunHeader({
  title,
  subtitle,
  backHref = "/program",
  backLabel = "Lesson Kits",
}: Props) {
  return (
    <header className="lesson-run-header">
      <div className="lesson-run-header__inner">
        <Link href={backHref} className="lesson-run-header__back">
          ← {backLabel}
        </Link>
        <div className="lesson-run-header__title-wrap">
          <p className="lesson-run-header__title">{title}</p>
          {subtitle ? <p className="lesson-run-header__subtitle">{subtitle}</p> : null}
        </div>
      </div>
    </header>
  );
}
