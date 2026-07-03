"use client";

import { LiturgicalVestmentsGame } from "@/components/LiturgicalVestmentsGame";
import { PassageTypingGame } from "@/components/PassageTypingGame";
import { WordFallTypingGame } from "@/components/WordFallTypingGame";
import { LESSON_WORD_PRESETS } from "@/lib/lesson-kit/constants";
import { gospelMaxCharsForBlock } from "@/lib/lesson-kit/family-blocks";
import type { LessonBlockDto, LessonKitDto } from "@/lib/lesson-kit/types";
import { loadMassDayForTyping } from "@/lib/load-mass-day-typing";
import { todayUniversalis, toDateKey } from "@/lib/dates";
import type { ReadingKind } from "@/types/mass";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Props = {
  block: LessonBlockDto;
  kit: LessonKitDto;
  mode: "classroom" | "family";
};

function LessonGospelBlock({ block, kit, mode }: Props) {
  const today = useMemo(() => toDateKey(todayUniversalis()), []);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const readingKind = (block.config.readingKind ?? "gospel") as ReadingKind;
  const maxChars = gospelMaxCharsForBlock(block, kit, mode);

  useEffect(() => {
    let cancelled = false;
    void loadMassDayForTyping(today)
      .then((day) => {
        if (cancelled) return;
        const reading = day.readings.find((r) => r.kind === readingKind);
        setText(reading?.text?.trim() ?? "");
      })
      .catch(() => {
        if (!cancelled) setText("");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [today, readingKind]);

  if (loading) {
    return <p className="text-sm text-[var(--color-muted)]">Loading today&apos;s reading…</p>;
  }
  if (!text) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Reading not available.{" "}
        <Link href="/bible/gospel" className="font-semibold text-[var(--color-link)]">
          Open Gospel hub
        </Link>
      </p>
    );
  }

  return (
    <PassageTypingGame
      text={text}
      appearance="gospel"
      hideInstructions
      embedded
      maxChars={maxChars}
      celebrateOnComplete
      showSaveButton={false}
    />
  );
}

function LessonBibleBlock({ block, kit, mode }: Props) {
  const { bookSlug, chapter } = block.config;
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookSlug || !chapter) return;
    let cancelled = false;
    void fetch(`/api/bible/chapter/${bookSlug}/${chapter}`)
      .then((r) => r.json())
      .then((data: { text?: string }) => {
        if (!cancelled) setText(data.text?.trim() ?? "");
      })
      .catch(() => {
        if (!cancelled) setText("");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookSlug, chapter]);

  if (!bookSlug || !chapter) {
    return <p className="text-sm text-[var(--color-muted)]">Bible chapter not configured.</p>;
  }
  if (loading) return <p className="text-sm text-[var(--color-muted)]">Loading chapter…</p>;
  if (!text) {
    return (
      <Link
        href={`/bible/read/${bookSlug}/${chapter}`}
        className="font-semibold text-[var(--color-link)]"
      >
        Open {bookSlug} {chapter}
      </Link>
    );
  }

  const maxChars =
    mode === "family"
      ? (block.config.maxChars ?? kit.familyMode?.gospelMaxChars ?? 200)
      : block.config.maxChars;

  return (
    <PassageTypingGame
      text={text}
      appearance="gospel"
      hideInstructions
      embedded
      maxChars={maxChars}
      celebrateOnComplete
      showSaveButton={false}
    />
  );
}

function LessonPlayGameBlock({ block }: { block: LessonBlockDto }) {
  const slug = block.config.gameSlug ?? "liturgical-vestments";

  if (slug === "liturgical-vestments") {
    return <LiturgicalVestmentsGame />;
  }

  const href =
    slug === "hangman"
      ? "/games/hangman/index.html"
      : slug === "church"
        ? "/play/church"
        : `/play/${slug}`;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
      {slug === "hangman" ? (
        <iframe
          title="Hangman"
          src={href}
          className="h-[min(420px,60vh)] w-full border-0"
        />
      ) : (
        <div className="p-6 text-center">
          <Link href={href} className="lesson-big-button inline-flex no-underline">
            Open game
          </Link>
        </div>
      )}
    </div>
  );
}

function LessonTypingWordsBlock({ block }: { block: LessonBlockDto }) {
  const preset = block.config.wordPreset
    ? LESSON_WORD_PRESETS[block.config.wordPreset]
    : undefined;
  const wordFilter = preset?.words ?? block.config.wordIds;

  return <WordFallTypingGame wordFilter={wordFilter} compact />;
}

function LessonResourceBlock({ block }: { block: LessonBlockDto }) {
  const slug = block.config.resourceSlug;
  if (!slug) {
    return <p className="text-sm text-[var(--color-muted)]">No resource selected.</p>;
  }
  return (
    <div className="lesson-note">
      <Link href={`/resources/${slug}`} className="text-lg font-bold text-[var(--color-link)]">
        Open activity
      </Link>
      <p className="mt-2 text-sm text-[var(--color-muted)]">Full craft instructions on the resource page.</p>
    </div>
  );
}

function LessonMassTodayBlock() {
  return (
    <div className="lesson-note">
      <p className="font-semibold text-[var(--color-ink)]">Today in the Church calendar</p>
      <Link href="/mass" className="mt-3 inline-block font-semibold text-[var(--color-link)]">
        Open Daily Mass
      </Link>
    </div>
  );
}

function LessonNoteBlock({ block }: { block: LessonBlockDto }) {
  const html = block.config.html ?? "";
  if (!html.trim()) return null;
  return <div className="lesson-note rich-content" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function LessonBlockContent({ block, kit, mode }: Props) {
  switch (block.type) {
    case "CUSTOM_NOTE":
      return <LessonNoteBlock block={block} />;
    case "PLAY_GAME":
      return <LessonPlayGameBlock block={block} />;
    case "TYPING_WORDS":
      return <LessonTypingWordsBlock block={block} />;
    case "HANGMAN_WORDS":
      return <LessonPlayGameBlock block={{ ...block, config: { gameSlug: "hangman" } }} />;
    case "GOSPEL_TYPING":
      return <LessonGospelBlock block={block} kit={kit} mode={mode} />;
    case "BIBLE_CHAPTER":
      return <LessonBibleBlock block={block} kit={kit} mode={mode} />;
    case "RESOURCE":
      return <LessonResourceBlock block={block} />;
    case "MASS_TODAY":
      return <LessonMassTodayBlock />;
    default:
      return <p className="text-sm text-[var(--color-muted)]">Unknown step type.</p>;
  }
}
