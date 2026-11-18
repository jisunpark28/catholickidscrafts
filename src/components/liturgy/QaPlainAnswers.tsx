import type { PublicQaCard } from "@/lib/liturgy-qa";

/** Crawlable Q&A under the flip deck: answers stay in plain HTML (not aria-hidden). */
export function QaPlainAnswers({
  cards,
  limit = 5,
}: {
  cards: PublicQaCard[];
  limit?: number;
}) {
  const items = cards.filter((c) => c.question.trim() && c.answer.trim()).slice(0, Math.min(5, Math.max(1, limit)));
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="liturgy-qa-plain" className="mx-auto mt-8 w-full max-w-5xl px-1 sm:px-0">
      <h2 id="liturgy-qa-plain" className="text-xl font-bold text-[var(--color-ink)]">
        Questions and answers
      </h2>
      <div className="mt-4 space-y-5">
        {items.map((card) => (
          <article key={card.id}>
            <h3 className="text-base font-semibold text-[var(--color-ink)]">{card.question}</h3>
            <p className="mt-1 text-base leading-relaxed text-[var(--color-muted)]">{card.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
