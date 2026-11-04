"use client";

import { readHrefForDouay } from "@/lib/bible/chapter-pages";
import Link from "next/link";
import { useState } from "react";
import { mbFetch } from "./mb-fetch";
import "@/styles/moms-bible.css";

export type ChildNoteBannerData = {
  bookSlug: string;
  chapter: number;
  startVerse: number | null;
  ref: string;
  roleLabel: string;
};

/** Child: "💌 Mom left a new note for you in Psalm 34! [Open →]". */
export function NewNoteBanner({ note }: { note: ChildNoteBannerData }) {
  return (
    <div className="mb-banner" role="status">
      <p>
        <span aria-hidden>💌</span> {note.roleLabel} left a new note for you in {note.ref}!
      </p>
      <Link className="mb-banner__open" href={readHrefForDouay(note.bookSlug, note.chapter, note.startVerse ?? undefined)}>
        Open →
      </Link>
    </div>
  );
}

export type ParentReplyBannerData = {
  count: number;
  latest: { childId: string; childName: string; bookSlug: string; chapter: number; startVerse: number | null; ref: string } | null;
};

/** Parent: "💌 Mia sent a warm reply in Psalm 34:19! [Open →]" (in-app only; the text stays in the Bible). */
export function ParentReplyBanner({ data }: { data: ParentReplyBannerData }) {
  const [hidden, setHidden] = useState(false);
  if (hidden || !data.latest || data.count === 0) return null;
  const l = data.latest;
  const [path, hash] = readHrefForDouay(l.bookSlug, l.chapter, l.startVerse ?? undefined).split("#");
  const href = `${path}?child=${encodeURIComponent(l.childId)}${hash ? `#${hash}` : ""}`;
  return (
    <div className="mb-banner" role="status">
      <p>
        <span aria-hidden>💌</span>{" "}
        {data.count === 1 ? `${l.childName} sent a warm reply in ${l.ref}!` : `${data.count} warm replies are waiting for you!`}
      </p>
      <div className="flex items-center gap-2">
        <Link className="mb-banner__open" href={href}>
          Open →
        </Link>
        <button
          type="button"
          className="mb-x"
          aria-label="Dismiss"
          onClick={() => {
            setHidden(true);
            void mbFetch("/api/moms-bible/notifications", "POST", { all: true });
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
