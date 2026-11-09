"use client";

import { QaFlipCards } from "@/components/liturgy/QaFlipCards";
import type { PublicQaCard, PublicQaTopic } from "@/lib/liturgy-qa";
import { useEffect, useState } from "react";

export type QaTopicTab = {
  slug: string;
  label: string;
  topic: PublicQaTopic | null;
  cards: PublicQaCard[];
};

/** One button per liturgy topic; only the chosen topic's cards show. The choice lives in the URL hash (client only). */
export function QaCardsByTopic({ tabs }: { tabs: QaTopicTab[] }) {
  const [selected, setSelected] = useState(tabs[0]?.slug ?? "");

  useEffect(() => {
    const sync = () => {
      const slug = window.location.hash.slice(1);
      setSelected(tabs.some((tab) => tab.slug === slug) ? slug : (tabs[0]?.slug ?? ""));
    };
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, [tabs]);

  function choose(slug: string) {
    setSelected(slug);
    const next = `${window.location.pathname}${window.location.search}#${slug}`;
    window.history.replaceState(null, "", next);
  }

  return (
    <>
      <div role="tablist" aria-label="Q&A card topics" className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = tab.slug === selected;
          return (
            <button
              key={tab.slug}
              type="button"
              role="tab"
              id={`qa-tab-${tab.slug}`}
              aria-selected={active}
              aria-controls={`qa-panel-${tab.slug}`}
              data-qa-tab={tab.slug}
              onClick={() => choose(tab.slug)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d451d] ${
                active
                  ? "border-[#b46139] bg-[#fbe8dc] text-[#9d451d] shadow-sm"
                  : "border-[#e8d9cd] bg-[#fffdfa] text-[#493a30] hover:border-[#c8906c] hover:bg-[#fff2e8]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <section
          key={tab.slug}
          role="tabpanel"
          id={`qa-panel-${tab.slug}`}
          aria-labelledby={`qa-tab-${tab.slug}`}
          hidden={tab.slug !== selected}
          data-qa-topic={tab.slug}
          className="mt-8"
        >
          {tab.topic && tab.cards.length > 0 ? (
            <QaFlipCards cards={tab.cards} cardBackColor={tab.topic.cardBackColor} fit />
          ) : (
            <p className="text-base text-[#6b4a2f]" data-qa-empty>
              No {tab.label} cards yet.
            </p>
          )}
        </section>
      ))}
    </>
  );
}