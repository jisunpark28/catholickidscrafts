import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { PhotoBoothGame } from "@/components/PhotoBoothGame";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "4-Cut Photo Booth for Kids",
  description:
    "Make a 4-cut photo strip with Catholic frames, stickers and backgrounds. Use the camera or upload photos; editing happens on your device, not our servers.",
  path: "/play/photo-booth",
});

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
        <PageHeader title={copyText(copy, "play.photobooth.page.title", "4-Cut Photo Booth")} />
      </div>

      <PhotoBoothGame />

      <p className="mt-6 text-xs text-[var(--color-muted)]">
        Photos are edited only on your device—they are not uploaded to our servers.
      </p>
    </PageShell>
  );
}
