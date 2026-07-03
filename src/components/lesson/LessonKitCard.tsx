import Link from "next/link";

type Props = {
  title: string;
  description: string;
  stepCount: number;
  estMinutes: number;
  runHref: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function LessonKitCard({
  title,
  description,
  stepCount,
  estMinutes,
  runHref,
  secondaryHref,
  secondaryLabel,
}: Props) {
  return (
    <article className="lesson-kit-card">
      <h3 className="text-lg font-bold text-[var(--color-ink)]">{title}</h3>
      {description ? (
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">{description}</p>
      ) : null}
      <p className="lesson-kit-card__meta">
        {stepCount} steps · ~{estMinutes} min
      </p>
      <div className="mt-auto flex flex-wrap gap-2">
        <Link href={runHref} className="lesson-big-button flex-1 text-center no-underline">
          Run
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="lesson-big-button lesson-big-button--secondary flex-1 text-center no-underline"
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
