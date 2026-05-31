import type { MassReading } from "@/types/mass";

type Props = { reading: MassReading };

export function MassReadingBlock({ reading }: Props) {
  return (
    <section className="border border-[var(--color-border)] bg-white px-6 py-8 sm:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
        {reading.label}
      </p>
      {reading.title && (
        <h3 className="mt-3 text-lg font-bold text-[var(--color-ink)]">{reading.title}</h3>
      )}
      <div className="prose-mass mt-5 whitespace-pre-wrap">{reading.text}</div>
    </section>
  );
}
