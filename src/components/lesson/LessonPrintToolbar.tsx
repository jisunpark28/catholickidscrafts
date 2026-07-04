"use client";

import { LessonKitNav, teacherPrintNavItems } from "@/components/lesson/LessonKitNav";
import { LessonKitDocxDownloadLink } from "@/components/lesson/LessonKitDocxDownloadLink";
import { LessonKitPdfDownloadLink } from "@/components/lesson/LessonKitPdfDownloadLink";

type Props = {
  kitId: string;
};

export function LessonPrintToolbar({ kitId }: Props) {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white px-4 py-3 print:hidden">
      <LessonKitNav items={teacherPrintNavItems(kitId)} />
      <div className="flex flex-wrap items-center gap-2">
        <LessonKitDocxDownloadLink
          kitId={kitId}
          className="lesson-big-button lesson-big-button--secondary !min-h-0 !w-auto !px-4 !py-2 !text-sm no-underline"
        />
        <LessonKitPdfDownloadLink
          kitId={kitId}
          className="lesson-big-button lesson-big-button--secondary !min-h-0 !w-auto !px-4 !py-2 !text-sm no-underline"
        />
        <button
          type="button"
          onClick={() => window.print()}
          className="lesson-big-button !min-h-0 !w-auto !px-4 !py-2 !text-sm"
        >
          Print
        </button>
      </div>
    </div>
  );
}
