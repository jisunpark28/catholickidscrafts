import { LockedPreview } from "@/components/resource/LockedPreview";
import { NewsletterSubscribeForm } from "@/components/seo/NewsletterSubscribeForm";
import { cardLockedPreviewSrc, cardThumbSrc } from "@/lib/resource/card-meta";
import type { SaintStoryViewData } from "@/lib/seo/saint-story-view";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const SAINTS_HUB = "/catholic-saints-for-kids";

export type SaintStoryView = SaintStoryViewData;

type Props = {
  story: SaintStoryView;
  /** Clear card artwork when Plus or this week's free card. */
  canPreview: boolean;
  /** Print / Save / Share actions under the card image (auth-aware). */
  actions?: ReactNode;
  /** Optional breadcrumb / back control above the cream article. */
  back?: ReactNode;
  showNewsletter?: boolean;
  showHubLink?: boolean;
};

function FactPills({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-[#f0d9b8] bg-[#fff8f0] px-3 py-0.5 text-sm text-[#1f2937]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function SaintFactBoxCard({
  box,
  showStory,
}: {
  box: NonNullable<SaintStoryViewData["factBox"]>;
  showStory: boolean;
}) {
  const rows: { label: string; content: ReactNode }[] = [];
  if (box.patron.length > 0) rows.push({ label: "Patron of", content: <FactPills items={box.patron} /> });
  if (box.symbols.length > 0) rows.push({ label: "Symbols", content: <FactPills items={box.symbols} /> });
  if (showStory && box.story) {
    rows.push({
      label: "1-Line Story",
      content: <p className="m-0 text-base leading-relaxed text-[#374151]">{box.story}</p>,
    });
  }
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="fact-box" className="rounded-2xl border border-[#f0d9b8] bg-white/90 p-4">
      <h2 id="fact-box" className="m-0 font-[Georgia,serif] text-lg font-bold text-[#1f2937]">
        Fact Box
      </h2>
      <dl className="mb-0 mt-2 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
            <dt className="shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wide text-[#9a6b3f] sm:w-28">
              {row.label}
            </dt>
            <dd className="m-0">{row.content}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Full saint SEO story layout (card + Print/Save, set, H1, feast, quote, Fact Box,
 * family questions, Bible verses link, optional newsletter) — shared by
 * `/catholic-saints-for-kids/[slug]` and Printables Cards detail.
 */
export function SaintStoryPanel({
  story,
  canPreview,
  actions,
  back,
  showNewsletter = true,
  showHubLink = true,
}: Props) {
  return (
    <article className="rounded-[24px] bg-[#fff3e6] p-4 sm:p-6 lg:p-8">
      {back}

      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-stretch">
        <figure className="mx-auto w-44 shrink-0 sm:mx-0 sm:w-52 lg:flex lg:w-auto lg:flex-col">
          <div className="rounded-2xl border border-[#f0d9b8] bg-white p-2 shadow-sm lg:flex lg:min-h-[12rem] lg:flex-1 lg:flex-col lg:bg-[#fef9f6]">
            <div className="relative lg:flex-1">
              {canPreview ? (
                <Image
                  src={cardThumbSrc(story.id)}
                  alt={`${story.title} saint card for kids`}
                  width={432}
                  height={540}
                  unoptimized
                  className="block h-auto w-full rounded-lg bg-[#fbf7f1] lg:absolute lg:inset-0 lg:h-full lg:bg-transparent lg:object-contain"
                />
              ) : (
                <LockedPreview className="rounded-lg" label={`${story.title}: unlock with Plus`}>
                  <Image
                    src={cardLockedPreviewSrc(story.id)}
                    alt=""
                    width={216}
                    height={270}
                    unoptimized
                    draggable={false}
                    className="block h-auto w-full rounded-lg lg:absolute lg:inset-0 lg:h-full lg:object-contain"
                  />
                </LockedPreview>
              )}
            </div>
          </div>
          {actions ? <div className="mt-2 shrink-0">{actions}</div> : null}
        </figure>

        <div className="min-w-0 flex-1 space-y-4">
          <header>
            <p className="m-0 text-sm font-semibold uppercase tracking-wide text-[#9a6b3f]">{story.set}</p>
            <h1 className="mt-1 font-[Georgia,serif] text-3xl font-bold text-[#1f2937] sm:text-4xl">{story.h1}</h1>
            {story.when ? (
              <p className="mb-0 mt-2 text-base text-[#4b5563]">
                <span className="font-semibold text-[#1f2937]">Feast day:</span> {story.when}
              </p>
            ) : null}
          </header>

          <blockquote className="m-0 rounded-2xl border-l-4 border-[#c9773a] bg-white/90 p-4 text-lg font-medium leading-relaxed text-[#1f2937]">
            “{story.text}”
            {story.ref ? <footer className="mt-2 text-sm font-normal text-[#6b7280]">{story.ref}</footer> : null}
          </blockquote>

          {story.factBox ? <SaintFactBoxCard box={story.factBox} showStory={story.showStory} /> : null}
        </div>
      </div>

      <section className="mt-8 max-w-3xl" aria-labelledby="talk">
        <h2 id="talk" className="m-0 font-[Georgia,serif] text-xl font-bold text-[#1f2937]">
          Family conversation questions
        </h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-base leading-relaxed text-[#374151]">
          {story.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </section>

      <p className="mb-0 mt-6 text-sm text-[#4b5563]">
        Looking for Scripture for a hard day at home?{" "}
        <Link href="/bible-verses-for-kids" className="font-semibold text-[#335599] hover:underline">
          Bible verses for kids
        </Link>
      </p>

      {showNewsletter ? (
        <div className="mt-10">
          <NewsletterSubscribeForm source="catholic-saints-for-kids" />
        </div>
      ) : null}

      {showHubLink ? (
        <p className="mb-0 mt-6 text-sm text-[#6b7280]">
          <Link href={SAINTS_HUB} className="font-semibold text-[#335599] hover:underline">
            ← All Catholic saints for kids
          </Link>
        </p>
      ) : null}
    </article>
  );
}
