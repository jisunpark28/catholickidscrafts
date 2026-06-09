import Link from "next/link";
import { FaceToEmojiEmbed } from "@/components/FaceToEmojiEmbed";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { canonicalForPath } from "@/lib/site-metadata";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Face to Emoji",
  description:
    "Upload a photo and replace faces with emoji automatically—private, in-browser editing for class parties and feast days.",
  ...canonicalForPath("/play/face-to-emoji"),
};

export default async function FaceToEmojiPage() {
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
          title={copyText(copy, "play.facetemoji.page.title", "Face to Emoji")}
          subtitle={copyText(copy, "play.facetemoji.page.subtitle", "")}
          programNote={copyText(copy, "play.facetemoji.page.program_note", "")}
        />
      </div>

      <div className="mt-4">
        <FaceToEmojiEmbed />
      </div>

      <p className="mt-6 text-xs text-[var(--color-muted)]">
        {copyText(
          copy,
          "play.facetemoji.privacy_note",
          "Photos are processed in your browser only—they are not uploaded to our servers. See our Privacy Policy for details.",
        )}{" "}
        <Link href="/privacy" className="text-[var(--color-link)]">
          Privacy Policy
        </Link>
        .
      </p>
    </PageShell>
  );
}
