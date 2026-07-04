"use client";

import { LessonIcon } from "@/components/icons/lesson/LessonIcon";
import { LessonKitDocxDownloadLink } from "@/components/lesson/LessonKitDocxDownloadLink";
import { LessonKitPdfDownloadLink } from "@/components/lesson/LessonKitPdfDownloadLink";
import { LessonBigButton } from "@/components/lesson/LessonUi";
import { lessonKitShareMessage } from "@/lib/lesson-kit/share-message";
import { useCallback, useState } from "react";

type Props = {
  shareSlug: string;
  title: string;
  /** When set, show PDF / Word download links (PR-9/10). */
  kitId?: string;
};

type CopyTarget = "classroom" | "home" | "message";

function qrImageUrl(url: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`;
}

export function LessonShareSheet({ shareSlug, title, kitId }: Props) {
  const [copied, setCopied] = useState<CopyTarget | null>(null);
  const [qrFor, setQrFor] = useState<"classroom" | "home" | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const classroom = `${origin}/lesson/${shareSlug}`;
  const home = `${origin}/lesson/${shareSlug}/family`;
  const shareMessage = lessonKitShareMessage({ title, classroomUrl: classroom, homeUrl: home });

  const copyText = useCallback(async (which: CopyTarget, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleQr = (which: "classroom" | "home") => {
    setQrFor((current) => (current === which ? null : which));
  };

  return (
    <div className="border border-[var(--color-border)] bg-white p-5">
      <h3 className="text-lg font-bold text-[var(--color-ink)]">Share</h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{title}</p>

      <div className="mt-4">
        <p className="lesson-share-section__heading">Links</p>
        {(
          [
            { which: "classroom" as const, icon: "building" as const, label: "Classroom", url: classroom },
            { which: "home" as const, icon: "home" as const, label: "At home", url: home },
          ] as const
        ).map((row) => (
          <div key={row.which} className="lesson-share-block">
            <div className="lesson-share-row">
              <LessonIcon name={row.icon} size="sm" />
              <span className="lesson-share-row__label">{row.label}</span>
              <LessonBigButton
                variant="secondary"
                className="!min-h-0 !w-auto !px-4 !py-2 !text-sm"
                onClick={() => void copyText(row.which, row.url)}
              >
                {copied === row.which ? "Copied" : "Copy link"}
              </LessonBigButton>
              <button
                type="button"
                onClick={() => toggleQr(row.which)}
                className="lesson-share-qr-toggle"
                aria-expanded={qrFor === row.which}
              >
                QR
              </button>
            </div>
            {qrFor === row.which ? (
              <div className="lesson-share-qr">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl(row.url)}
                  width={180}
                  height={180}
                  alt={`QR code for ${row.label} link`}
                  className="lesson-share-qr__img"
                />
                <p className="lesson-share-qr__hint">Scan to open on a phone or tablet.</p>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="lesson-share-section">
        <p className="lesson-share-section__heading">Message for families</p>
        <p className="lesson-share-message-preview">{shareMessage}</p>
        <LessonBigButton
          variant="secondary"
          className="mt-3 !min-h-0 !w-auto !px-4 !py-2 !text-sm"
          onClick={() => void copyText("message", shareMessage)}
        >
          {copied === "message" ? "Copied" : "Copy message"}
        </LessonBigButton>
      </div>

      {kitId ? (
        <div className="lesson-share-section">
          <p className="lesson-share-section__heading">Downloads</p>
          <div className="lesson-share-downloads">
            <LessonKitPdfDownloadLink
              kitId={kitId}
              className="lesson-big-button lesson-big-button--secondary !min-h-0 !w-auto !px-4 !py-2 !text-sm no-underline"
            />
            <LessonKitDocxDownloadLink
              kitId={kitId}
              className="lesson-big-button lesson-big-button--secondary !min-h-0 !w-auto !px-4 !py-2 !text-sm no-underline"
            />
          </div>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Printable lesson plan (US Letter). Same content as Print view.
          </p>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-[var(--color-muted)]">Home link is shorter (~10 min).</p>
    </div>
  );
}
