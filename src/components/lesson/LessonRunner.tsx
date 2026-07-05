"use client";

import { LessonBlockContent } from "@/components/lesson/LessonBlockContent";
import { LessonBigButton, LessonProgressBar, LessonStepTitle } from "@/components/lesson/LessonUi";
import { LessonIcon } from "@/components/icons/lesson/LessonIcon";
import { isClassroomHeroBlock } from "@/lib/lesson-kit/classroom-blocks";
import { blockDisplayLabel, filterFamilyBlocks } from "@/lib/lesson-kit/family-blocks";
import type { LessonKitDto } from "@/lib/lesson-kit/types";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import "@/styles/lesson-kit.css";

type Props = {
  kit: LessonKitDto;
  mode: "classroom" | "family";
  onOpenRecorded?: boolean;
  exitHref?: string;
  exitLabel?: string;
};

export function LessonRunner({
  kit,
  mode,
  onOpenRecorded = true,
  exitHref = "/program",
  exitLabel = "Lesson Kits",
}: Props) {
  const blocks = useMemo(() => filterFamilyBlocks(kit, mode), [kit, mode]);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!onOpenRecorded) return;
    void fetch(`/api/lesson/${kit.shareSlug}/open`, { method: "POST" }).catch(() => {});
  }, [kit.shareSlug, onOpenRecorded]);

  useEffect(() => {
    try {
      localStorage.setItem(`lesson-offline:${kit.shareSlug}`, JSON.stringify(kit));
    } catch {
      /* ignore quota */
    }
  }, [kit]);

  const current = blocks[step];
  const isLast = step >= blocks.length - 1;
  const canGoBack = step > 0 && !finished;
  const heroStep = mode === "classroom" && current ? isClassroomHeroBlock(current) : false;

  const goNext = useCallback(() => {
    if (isLast) {
      setFinished(true);
      if (mode === "family") {
        void fetch(`/api/lesson/${kit.shareSlug}/complete`, { method: "POST" }).catch(() => {});
      }
      return;
    }
    setStep((s) => s + 1);
  }, [isLast, mode, kit.shareSlug]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  if (blocks.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-[var(--color-muted)]">This lesson has no steps yet.</p>
        <Link href={exitHref} className="lesson-big-button lesson-big-button--secondary mt-6 inline-flex no-underline">
          ← {exitLabel}
        </Link>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <LessonIcon name="check" active size="lg" className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">Done</h1>
        <p className="mt-2 text-[var(--color-muted)]">{kit.title}</p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href={exitHref} className="lesson-big-button inline-flex no-underline">
            ← {exitLabel}
          </Link>
          {mode === "classroom" ? (
            <Link
              href={`/lesson/${kit.shareSlug}/family`}
              className="lesson-big-button lesson-big-button--secondary inline-flex no-underline"
            >
              At home link
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  const shellClass =
    mode === "classroom"
      ? `lesson-runner lesson-runner--classroom${heroStep ? " lesson-runner--hero" : ""}`
      : "lesson-runner";

  return (
    <div className={shellClass}>
      <LessonProgressBar total={blocks.length} current={step} compact={mode === "classroom"} />
      {current && (
        <>
          {!heroStep ? (
            <div className="lesson-runner__title">
              <LessonStepTitle blockType={current.type} label={blockDisplayLabel(current)} />
            </div>
          ) : (
            <p className="lesson-runner__hero-label sr-only">{blockDisplayLabel(current)}</p>
          )}
          <div className="lesson-runner__content">
            <LessonBlockContent block={current} kit={kit} mode={mode} />
          </div>
        </>
      )}
      <div className="lesson-runner__nav">
        {canGoBack ? (
          <LessonBigButton variant="secondary" className="sm:flex-1" onClick={goBack}>
            Previous
          </LessonBigButton>
        ) : null}
        <LessonBigButton className="sm:flex-1" onClick={goNext}>
          {isLast ? "Done" : "Next"}
        </LessonBigButton>
      </div>
    </div>
  );
}
