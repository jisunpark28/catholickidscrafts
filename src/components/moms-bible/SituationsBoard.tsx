"use client";

import type { MbColorKey } from "@/lib/moms-bible/constants";
import Link from "next/link";
import { useEffect, useState } from "react";
import "@/styles/moms-bible.css";

export type BoardVerse = { label: string; href: string; text: string };
export type BoardSituation = { key: string; emoji: string; title: string; verses: BoardVerse[] };
export type BoardGroup = { color: MbColorKey; emoji: string; title: string; situations: BoardSituation[] };

/** "When my child is…" (mockup 4): tap a moment, its recommended verses open under the group. */
export function SituationsBoard({ groups }: { groups: BoardGroup[] }) {
  const [selected, setSelected] = useState<string>(groups[0]?.situations[0]?.key ?? "");
  useEffect(() => {
    const key = window.location.hash.replace(/^#s-/, "");
    if (key && groups.some((g) => g.situations.some((s) => s.key === key))) setSelected(key);
  }, [groups]);

  return (
    <div className="mb-situations__groups">
      {groups.map((g) => {
        const sel = g.situations.find((s) => s.key === selected);
        return (
          <section key={g.title} className={`mb-sgroup mb-sgroup--${g.color.toLowerCase()}`}>
            <h2 className="mb-sgroup__title">
              <span aria-hidden>{g.emoji}</span> {g.title}
            </h2>
            <div>
              {g.situations.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className="mb-chip"
                  aria-pressed={s.key === selected}
                  aria-controls={`recs-${g.color}`}
                  onClick={() => {
                    setSelected(s.key);
                    window.history.replaceState(null, "", `#s-${s.key}`);
                  }}
                >
                  {s.emoji} {s.title}
                </button>
              ))}
            </div>
            {sel && (
              <div id={`recs-${g.color}`} className="mb-recs" aria-live="polite">
                <div className="mb-lbl">Recommended verses · {sel.title}</div>
                <div className="mb-recs__list">
                  {sel.verses.map((v) => (
                    <article key={v.label} className="mb-card">
                      <b>{v.label}</b>
                      {v.text && <p className="mb-recs__text">{v.text}</p>}
                      <Link href={v.href} className="mb-btn mb-btn--primary">
                        Open &amp; leave a note →
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
