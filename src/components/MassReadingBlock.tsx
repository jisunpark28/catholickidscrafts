import type { MassReading } from "@/types/mass";

type Props = { reading: MassReading; usccbPageUrl?: string };

export function MassReadingBlock({ reading, usccbPageUrl }: Props) {
  const href = reading.externalUrl ?? usccbPageUrl;
  const hasText = Boolean(reading.text?.trim());

  return (
    <section className="border border-[var(--color-border)] bg-white px-6 py-8 sm:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
        {reading.label}
      </p>
      {reading.title && (
        <h3 className="mt-3 text-lg font-bold text-[var(--color-ink)]">{reading.title}</h3>
      )}
      {hasText ? (
        <div className="prose-mass mt-5 whitespace-pre-wrap">{reading.text}</div>
      ) : (
        <p className="mt-5 text-[var(--color-muted)]">
          Full text is on the official USCCB Daily Readings site (copyright). Open the page below
          to read and print for class or home prayer.
        </p>
      )}
      {href && (
        <p className="mt-5">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            {hasText ? "Also on USCCB" : "Read on USCCB"}
          </a>
        </p>
      )}
    </section>
  );
}
