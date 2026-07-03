"use client";

import { LessonBlockContent } from "@/components/lesson/LessonBlockContent";
import { LessonBigButton, LessonProgressBar, LessonStepTitle } from "@/components/lesson/LessonUi";
import { LessonIcon } from "@/components/icons/lesson/LessonIcon";
import { blockDisplayLabel, filterFamilyBlocks } from "@/lib/lesson-kit/family-blocks";
import type { LessonKitDto } from "@/lib/lesson-kit/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import "@/styles/lesson-kit.css";

type Props = {
  kit: LessonKitDto;
  mode: "classroom" | "family";
  onOpenRecorded?: boolean;
};

export function LessonRunner({ kit, mode, onOpenRecorded = true }: Props) {
  const blocks = useMemo(() => filterFamilyBlocks(kit, mode), [kit, mode]);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!onOpenRecorded) return;
    void fetch(`/api/lesson/${kit.shareSlug}/open`, { method: "POST" }).catch(() => {});
  }, [kit.shareSlug, onOpenRecorded]);

  const current = blocks[step];
  const isLast = step >= blocks.length - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      setFinished(true);
      return;
    }
    setStep((s) => s + 1);
  }, [isLast]);

  if (blocks.length === 0) {
    return (
      <p className="p-8 text-center text-[var(--color-muted)]">This lesson has no steps yet.</p>
    );
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <LessonIcon name="check" active size="lg" className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">Done</h1>
        <p className="mt-2 text-[var(--color-muted)]">{kit.title}</p>
        {mode === "classroom" && (
          <div className="mt-8">
            <a
              href={`/lesson/${kit.shareSlug}/family`}
              className="lesson-big-button lesson-big-button--secondary inline-flex no-underline"
            >
              At home link
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col px-4 py-6 sm:px-6">
      <LessonProgressBar total={blocks.length} current={step} />
      {current && (
        <>
          <div className="mt-4 mb-6">
            <LessonStepTitle blockType={current.type} label={blockDisplayLabel(current)} />
          </div>
          <div className="flex-1">
            <LessonBlockContent block={current} kit={kit} mode={mode} />
          </div>
        </>
      )}
      <div className="mt-8 pb-8">
        <LessonBigButton onClick={goNext}>{isLast ? "Done" : "Next"}</LessonBigButton>
      </div>
    </div>
  );
}
