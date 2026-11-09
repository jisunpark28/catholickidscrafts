"use client";

import type { MbColorKey } from "@/lib/moms-bible/constants";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "@/styles/moms-bible.css";

export type BoardVerse = { label: string; href: string; text: string };
export type BoardSituation = {
  key: string;
  emoji: string;
  title: string;
  note: string | null;
  care: string | null;
  verses: BoardVerse[];
};
export type BoardGroup = { color: MbColorKey; emoji: string; title: string; situations: BoardSituation[] };

const PREVIEW = 8;

type VersePack = { status: "loading" | "ready" | "error"; verses: { label: string; text: string }[] };

function haystack(situation: BoardSituation): string {
  return [situation.title, situation.note, situation.care, ...situation.verses.map((verse) => verse.label)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/** "When my child is…": four full-width groups, with search and a short chip preview. */
export function SituationsBoard({ groups }: { groups: BoardGroup[] }) {
  const [selected, setSelected] = useState<string>(groups[0]?.situations[0]?.key ?? "");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [packs, setPacks] = useState<Record<string, VersePack>>({});
  const cache = useRef<Record<string, VersePack>>({});
  const total = groups.reduce((sum, group) => sum + group.situations.length, 0);
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matchedByGroup = groups.map((group) =>
    group.situations.filter((situation) => words.every((word) => haystack(situation).includes(word))),
  );
  const matchCount = matchedByGroup.reduce((sum, list) => sum + list.length, 0);

  useEffect(() => {
    const key = window.location.hash.replace(/^#s-/, "");
    if (!key) return;
    const group = groups.find((item) => item.situations.some((situation) => situation.key === key));
    if (!group) return;
    setSelected(key);
    const index = group.situations.findIndex((situation) => situation.key === key);
    if (index >= PREVIEW) setExpanded((current) => ({ ...current, [group.title]: true }));
  }, [groups]);

  useEffect(() => {
    if (!selected) return;
    const cached = cache.current[selected];
    if (cached?.status === "ready") {
      setPacks((current) => ({ ...current, [selected]: cached }));
      return;
    }
    let cancel = false;
    setPacks((current) => ({ ...current, [selected]: { status: "loading", verses: [] } }));
    fetch(`/api/moms-bible/situation-verse?key=${encodeURIComponent(selected)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data: { verses?: { label: string; text: string }[] }) => {
        const pack: VersePack = { status: "ready", verses: Array.isArray(data.verses) ? data.verses : [] };
        cache.current[selected] = pack;
        if (!cancel) setPacks((current) => ({ ...current, [selected]: pack }));
      })
      .catch(() => {
        if (!cancel) setPacks((current) => ({ ...current, [selected]: { status: "error", verses: [] } }));
      });
    return () => {
      cancel = true;
    };
  }, [selected]);

  function choose(key: string) {
    setSelected(key);
    const next = `#s-${key}`;
    if (window.location.hash !== next) window.history.replaceState(null, "", next);
  }

  return (
    <div>
      <div className="mb-find">
        <label className="mb-find__label" htmlFor="mb-find-moment">
          Find a moment
        </label>
        <input
          id="mb-find-moment"
          type="search"
          value={query}
          placeholder="Nightmares, first communion, Psalm 23…"
          onChange={(event) => setQuery(event.target.value)}
        />
        {query ? (
          <button type="button" className="mb-more" onClick={() => setQuery("")}>
            Clear
          </button>
        ) : null}
      </div>
      <p className="mb-find__status" aria-live="polite">
        {words.length ? `${matchCount} of ${total} moments match` : `${total} moments in ${groups.length} groups`}
      </p>
      <div className="mb-situations__groups">
        {groups.map((group, index) => {
          const matched = matchedByGroup[index] ?? [];
          const open = expanded[group.title] === true;
          let visible = open ? matched : matched.slice(0, PREVIEW);
          const selectedMatch = matched.find((situation) => situation.key === selected);
          if (!open && selectedMatch && !visible.some((situation) => situation.key === selectedMatch.key)) {
            visible = [...visible, selectedMatch];
          }
          const hidden = matched.length - visible.length;
          const selectedHere = group.situations.find((situation) => situation.key === selected);
          const showRecs = Boolean(selectedHere && matched.some((situation) => situation.key === selected));
          return (
            <section key={group.title} className={`mb-sgroup mb-sgroup--${group.color.toLowerCase()}`}>
              <h2 className="mb-sgroup__title">
                <span aria-hidden>{group.emoji}</span> {group.title}
                <span className="mb-sgroup__count">{group.situations.length} moments</span>
              </h2>
              {words.length ? (
                <p className="mb-sgroup__match">
                  {matched.length} of {group.situations.length} match
                </p>
              ) : null}
              <div>
                {visible.map((situation) => (
                  <button
                    key={situation.key}
                    id={`s-${situation.key}`}
                    type="button"
                    className="mb-chip"
                    aria-pressed={situation.key === selected}
                    aria-controls={`recs-${group.color}`}
                    onClick={() => choose(situation.key)}
                  >
                    {situation.emoji} {situation.title}
                  </button>
                ))}
              </div>
              {hidden > 0 ? (
                <button
                  type="button"
                  className="mb-more"
                  aria-expanded={false}
                  onClick={() => setExpanded((current) => ({ ...current, [group.title]: true }))}
                >
                  Show all {matched.length} in {group.title}
                </button>
              ) : null}
              {open && matched.length > PREVIEW ? (
                <button
                  type="button"
                  className="mb-more"
                  aria-expanded={true}
                  onClick={() => setExpanded((current) => ({ ...current, [group.title]: false }))}
                >
                  Show fewer
                </button>
              ) : null}
              {matched.length === 0 ? <p className="mb-sgroup__match">No moments in this group match.</p> : null}
              {showRecs && selectedHere ? (
                <Recommendation
                  group={group}
                  situation={selectedHere}
                  pack={packs[selectedHere.key]}
                />
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Recommendation({
  group,
  situation,
  pack,
}: {
  group: BoardGroup;
  situation: BoardSituation;
  pack: VersePack | undefined;
}) {
  return (
    <div id={`recs-${group.color}`} className="mb-recs" aria-live="polite">
      <div className="mb-lbl">Recommended verses · {situation.title}</div>
      <div className="mb-recs__list">
        {situation.verses.map((verse) => {
          const loaded = pack?.verses.find((item) => item.label === verse.label)?.text ?? "";
          return (
            <article key={verse.label} className="mb-card">
              <b>{verse.label}</b>
              {loaded ? (
                <p className="mb-recs__text">{loaded}</p>
              ) : (
                <p className="mb-recs__pending">
                  {pack?.status === "error" ? "Open the reader to see this verse." : "Loading this verse…"}
                </p>
              )}
              <Link href={verse.href} className="mb-btn mb-btn--primary">
                Open &amp; leave a note →
              </Link>
            </article>
          );
        })}
      </div>
      {situation.note ? (
        <p className="mb-mom-note">
          <b>A note you might leave</b>
          {situation.note}
        </p>
      ) : null}
      {situation.care ? (
        <p className="mb-care" role="note">
          <b>Also know</b>
          {situation.care}
        </p>
      ) : null}
    </div>
  );
}
