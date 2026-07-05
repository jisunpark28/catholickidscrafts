"use client";

import { LessonImageFigure } from "@/components/lesson/LessonImageFigure";
import { LessonKitHangmanGame } from "@/components/lesson/LessonKitHangmanGame";
import { LessonSlidesPlayer } from "@/components/lesson/LessonSlidesPlayer";
import { LiturgicalVestmentsGame } from "@/components/LiturgicalVestmentsGame";
import { PassageTypingGame } from "@/components/PassageTypingGame";
import { WordFallTypingGame } from "@/components/WordFallTypingGame";
import {
  isMediaPrimaryBlock,
  linkUploadedVideoUrl,
  linkVideoEmbedUrl,
} from "@/lib/lesson-kit/classroom-blocks";
import { gospelMaxCharsForBlock } from "@/lib/lesson-kit/family-blocks";
import { lessonKitWords, lessonKitWordsForTyping } from "@/lib/lesson-kit/kit-words";
import {
  lessonLinkButtonLabel,
  lessonLinkHref,
  lessonLinkOpensInNewTab,
} from "@/lib/lesson-kit/link-block";
import {
  lessonWritingMaxChars,
  lessonWritingMinChars,
  lessonWritingMode,
  lessonWritingPlaceholder,
  lessonWritingPrompt,
} from "@/lib/lesson-kit/writing-block";
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

export type LessonBlockVariant = "default" | "classroom";

function blockVariant(mode: "classroom" | "family", block: LessonBlockDto): LessonBlockVariant {
  if (mode === "classroom" && isMediaPrimaryBlock(block)) return "classroom";
  return "default";
}

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

function LessonPlayGameBlock({
  block,
  mode,
}: {
  block: LessonBlockDto;
  mode: "classroom" | "family";
}) {
  const slug = block.config.gameSlug ?? "liturgical-vestments";

  if (slug === "liturgical-vestments") {
    return <LiturgicalVestmentsGame />;
  }

  if (slug === "hangman" && mode === "classroom") {
    return <LessonKitHangmanGame block={block} compact />;
  }

  if (slug === "typing" && mode === "classroom") {
    const kitWords = lessonKitWords(block);
    return (
      <WordFallTypingGame
        customWords={lessonKitWordsForTyping(kitWords)}
        compact
      />
    );
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

function LessonTypingWordsBlock({
  block,
  mode,
}: {
  block: LessonBlockDto;
  mode: "classroom" | "family";
}) {
  const kitWords = lessonKitWords(block);

  if (mode === "classroom") {
    if (kitWords.length === 0) {
      return (
        <p className="text-sm text-[var(--color-muted)]">
          Add words in the lesson editor before running the typing game in class.
        </p>
      );
    }
    return (
      <WordFallTypingGame
        customWords={lessonKitWordsForTyping(kitWords)}
        compact
      />
    );
  }

  return (
    <WordFallTypingGame
      customWords={kitWords.length > 0 ? lessonKitWordsForTyping(kitWords) : undefined}
      compact
    />
  );
}

function LessonHangmanWordsBlock({ block }: { block: LessonBlockDto }) {
  return <LessonKitHangmanGame block={block} />;
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

function LessonLinkBlock({
  block,
  variant,
}: {
  block: LessonBlockDto;
  variant: LessonBlockVariant;
}) {
  const href = lessonLinkHref(block);
  const assetUrl = block.config.assetUrl?.trim();
  const newTab = lessonLinkOpensInNewTab(block);
  const label = lessonLinkButtonLabel(block);
  const fileLabel = block.config.assetFilename?.trim() || "Open file";
  const videoEmbed = variant === "classroom" ? linkVideoEmbedUrl(block) : null;
  const uploadedVideo = variant === "classroom" ? linkUploadedVideoUrl(block) : null;
  const uploadedImage =
    variant === "classroom" &&
    block.config.assetMimeType?.startsWith("image/") &&
    assetUrl
      ? assetUrl
      : null;

  if (variant === "classroom" && (videoEmbed || uploadedVideo)) {
    return (
      <div className="lesson-classroom-video">
        {videoEmbed ? (
          <iframe
            title={label}
            src={videoEmbed}
            className="lesson-classroom-video__frame"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            className="lesson-classroom-video__native"
            src={uploadedVideo!}
            controls
            playsInline
            preload="metadata"
          >
            <track kind="captions" />
          </video>
        )}
        {label && label !== "Open link" ? (
          <p className="lesson-classroom-video__caption">{label}</p>
        ) : null}
      </div>
    );
  }

  if (uploadedImage) {
    return (
      <figure className="lesson-image-figure lesson-image-figure--classroom">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={uploadedImage} alt={label} className="lesson-image-figure__img" />
        {label && label !== "Open link" ? (
          <figcaption className="lesson-image-figure__caption">{label}</figcaption>
        ) : null}
      </figure>
    );
  }

  if (!href && !assetUrl) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Link not configured. Add a URL or upload a file in the lesson editor.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {href ? (
        <a
          href={href}
          className="lesson-big-button inline-flex no-underline"
          {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {label}
        </a>
      ) : null}
      {assetUrl ? (
        <a
          href={assetUrl}
          className={`inline-flex no-underline ${
            href ? "lesson-big-button lesson-big-button--secondary" : "lesson-big-button"
          }`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {href ? fileLabel : label !== "Open link" ? label : fileLabel}
        </a>
      ) : null}
    </div>
  );
}

function LessonWritingBlock({ block }: { block: LessonBlockDto }) {
  const prompt = lessonWritingPrompt(block);
  const mode = lessonWritingMode(block);
  const maxChars = lessonWritingMaxChars(block);
  const minChars = lessonWritingMinChars(block);
  const [text, setText] = useState("");

  if (!prompt) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Writing prompt not configured. Add a question in the lesson editor.
      </p>
    );
  }

  if (mode === "display") {
    return (
      <div className="lesson-note">
        <p className="whitespace-pre-wrap text-lg leading-relaxed text-[var(--color-ink)]">
          {prompt}
        </p>
      </div>
    );
  }

  const count = text.length;
  const belowMin = minChars > 0 && count > 0 && count < minChars;

  return (
    <div className="space-y-3">
      <p className="text-lg font-semibold leading-relaxed text-[var(--color-ink)] whitespace-pre-wrap">
        {prompt}
      </p>
      <textarea
        className="lesson-writing-field"
        rows={5}
        value={text}
        maxLength={maxChars}
        placeholder={lessonWritingPlaceholder(block)}
        onChange={(e) => setText(e.target.value)}
        aria-label="Your answer"
      />
      <p
        className={`text-xs font-semibold ${belowMin ? "text-amber-700" : "text-[var(--color-muted)]"}`}
      >
        {count} / {maxChars} characters
        {minChars > 0 ? ` · at least ${minChars}` : ""}
      </p>
    </div>
  );
}

export function LessonBlockContent({ block, kit, mode }: Props) {
  const variant = blockVariant(mode, block);

  switch (block.type) {
    case "CUSTOM_NOTE":
      return <LessonNoteBlock block={block} />;
    case "WRITING":
      return <LessonWritingBlock block={block} />;
    case "PLAY_GAME":
      return <LessonPlayGameBlock block={block} mode={mode} />;
    case "TYPING_WORDS":
      return <LessonTypingWordsBlock block={block} mode={mode} />;
    case "HANGMAN_WORDS":
      return <LessonHangmanWordsBlock block={block} />;
    case "GOSPEL_TYPING":
      return <LessonGospelBlock block={block} kit={kit} mode={mode} />;
    case "BIBLE_CHAPTER":
      return <LessonBibleBlock block={block} kit={kit} mode={mode} />;
    case "RESOURCE":
      return <LessonResourceBlock block={block} />;
    case "LINK":
      return <LessonLinkBlock block={block} variant={variant} />;
    case "IMAGE":
      return <LessonImageFigure block={block} variant={variant} />;
    case "SLIDES":
      return <LessonSlidesPlayer block={block} variant={variant} />;
    case "MASS_TODAY":
      return <LessonMassTodayBlock />;
    default:
      return <p className="text-sm text-[var(--color-muted)]">Unknown step type.</p>;
  }
}
