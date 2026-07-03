"use client";

import { LessonIcon } from "@/components/icons/lesson/LessonIcon";
import { LessonBigButton } from "@/components/lesson/LessonUi";
import { useCallback, useState } from "react";

type Props = {
  shareSlug: string;
  title: string;
};

export function LessonShareSheet({ shareSlug, title }: Props) {
  const [copied, setCopied] = useState<"classroom" | "home" | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const classroom = `${origin}/lesson/${shareSlug}`;
  const home = `${origin}/lesson/${shareSlug}/family`;

  const copy = useCallback(async (which: "classroom" | "home", url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(which);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="border border-[var(--color-border)] bg-white p-5">
      <h3 className="text-lg font-bold text-[var(--color-ink)]">Share</h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{title}</p>
      <div className="mt-4">
        <div className="lesson-share-row">
          <LessonIcon name="building" size="sm" />
          <span className="lesson-share-row__label">Classroom</span>
          <LessonBigButton
            variant="secondary"
            className="!min-h-0 !w-auto !px-4 !py-2 !text-sm"
            onClick={() => void copy("classroom", classroom)}
          >
            {copied === "classroom" ? "Copied" : "Copy link"}
          </LessonBigButton>
        </div>
        <div className="lesson-share-row">
          <LessonIcon name="home" size="sm" />
          <span className="lesson-share-row__label">At home</span>
          <LessonBigButton
            variant="secondary"
            className="!min-h-0 !w-auto !px-4 !py-2 !text-sm"
            onClick={() => void copy("home", home)}
          >
            {copied === "home" ? "Copied" : "Copy link"}
          </LessonBigButton>
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--color-muted)]">Home link is shorter (~10 min).</p>
    </div>
  );
}
