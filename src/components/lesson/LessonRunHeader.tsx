import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  variant?: "default" | "classroom";
};

export function LessonRunHeader({
  title,
  subtitle,
  backHref = "/program",
  backLabel = "Lesson Kits",
  variant = "default",
}: Props) {
  return (
    <header className={`lesson-run-header${variant === "classroom" ? " lesson-run-header--classroom" : ""}`}>
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
