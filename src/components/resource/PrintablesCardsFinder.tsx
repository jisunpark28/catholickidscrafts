"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initialQ: string;
  level: 1 | 2;
  freeCardTitle?: string | null;
  prompts?: { label: string; href: string }[];
};

function cardsHref(q: string, level: 1 | 2, card?: string | null): string {
  const p = new URLSearchParams();
  p.set("view", "cards");
  if (q.trim()) p.set("q", q.trim());
  if (level === 2) p.set("level", "2");
  if (card) p.set("card", card);
  return `/resource?${p.toString()}`;
}

/** Middle finder for Cards mode: search first, then short prompts (saints live here). */
export function PrintablesCardsFinder({ initialQ, level, freeCardTitle, prompts }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);

  const defaultPrompts = prompts ?? [
    {
      label: freeCardTitle ? `This week's free card: ${freeCardTitle}` : "This week's free card",
      href: cardsHref("", level),
    },
    { label: "Search saints", href: cardsHref("saint", level) },
    { label: "Advent cards", href: cardsHref("advent", level) },
    { label: "Browse all cards", href: cardsHref("", level) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-[#c9773a]">Cards</p>

      <form
        role="search"
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(cardsHref(q, level));
        }}
      >
        <label className="flex items-center gap-2 rounded-full border border-[#e8d9cd] bg-[#fffdfa] px-3 py-2">
          <span aria-hidden className="text-[#806454]">
            ⌕
          </span>
          <span className="sr-only">Search cards</span>
          <input
            type="search"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cards…"
            maxLength={80}
            className="w-full bg-transparent text-sm text-[#1c1c1c] outline-none placeholder:text-[#9a8b7e]"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-[#c9773a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#b8470a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9773a]"
        >
          Search
        </button>
      </form>

      <div>
        <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wide text-[#806454]">Try this</p>
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
          {defaultPrompts.map((p) => (
            <li key={p.href + p.label}>
              <Link
                href={p.href}
                className="block rounded-lg px-2 py-1.5 text-sm text-[#335599] no-underline hover:bg-[#fff2e8] hover:text-[#9d451d]"
              >
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
