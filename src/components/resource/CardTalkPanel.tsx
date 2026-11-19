import type { CardTalk } from "@/lib/seo/card-talk";

type Props = {
  talk: CardTalk;
  /** Short Scripture reference printed on the card. */
  cardRef?: string;
};

/** Printed caption, short intro and 3 family questions for an opened non-saint card. */
export function CardTalkPanel({ talk, cardRef }: Props) {
  return (
    <div className="space-y-4">
      <blockquote className="m-0 rounded-2xl border-l-4 border-[#c9773a] bg-white/90 p-4 text-lg font-medium leading-relaxed text-[#1f2937]">
        <span className="whitespace-pre-line">“{talk.caption}”</span>
        {cardRef ? <footer className="mt-2 text-sm font-normal text-[#6b7280]">{cardRef}</footer> : null}
      </blockquote>
      {talk.answer ? (
        <details className="rounded-xl border border-[#f0d9b8] bg-white/90 px-4 py-2 text-sm text-[#374151]">
          <summary className="cursor-pointer font-semibold text-[#9a4f1c]">Show answer</summary>
          <p className="mb-1 mt-2">{talk.answer}</p>
        </details>
      ) : null}
      <div className="space-y-2 text-base leading-relaxed text-[#374151]">
        {talk.intro.map((p) => (
          <p key={p} className="m-0">
            {p}
          </p>
        ))}
      </div>
      <section aria-labelledby="card-talk">
        <h3 id="card-talk" className="m-0 font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
          Family conversation questions
        </h3>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-base leading-relaxed text-[#374151]">
          {talk.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
