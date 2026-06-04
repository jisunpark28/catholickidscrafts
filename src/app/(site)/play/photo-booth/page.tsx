import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { PhotoBoothGame } from "@/components/PhotoBoothGame";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "4-Cut Photo Booth",
  description:
    "Upload or take photos, then decorate with backgrounds and stickers—make a fun photo strip in your browser.",
};

export default function PhotoBoothPage() {
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
          title="4-Cut Photo Booth"
          subtitle="A light celebration activity—great after a rehearsal or saint-day party."
          programNote="Photos stay on the device (not uploaded here). Print or share from the family’s phone if your parish allows."
        />
      </div>

      <PhotoBoothGame />

      <p className="mt-6 text-xs text-[var(--color-muted)]">
        Photos are edited only on your device—they are not uploaded to our servers.
      </p>
    </PageShell>
  );
}
