import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { PhotoBoothGame } from "@/components/PhotoBoothGame";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "4-Cut Photo Booth",
  description:
    "Upload or take photos, then decorate with backgrounds and stickers—make a fun photo strip in your browser.",
  ...canonicalForPath("/play/photo-booth"),
};

export default async function PhotoBoothPage() {
  const copy = await getSiteCopyMap();

  return (
    <PageShell wide>
      <Link
        href="/play"
        className="text-sm font-semibold text-[var(--color-link)] hover:underline"
      >
        ← Play & learn
      </Link>

      <div className="mt-6">
        <PageHeader
          title={copyText(copy, "play.photobooth.page.title", "4-Cut Photo Booth")}
          subtitle={copyText(copy, "play.photobooth.page.subtitle", "")}
          programNote={copyText(copy, "play.photobooth.page.program_note", "")}
        />
      </div>

      <PhotoBoothGame />

      <p className="mt-6 text-xs text-[var(--color-muted)]">
        Photos are edited only on your device—they are not uploaded to our servers.
      </p>
    </PageShell>
  );
}
