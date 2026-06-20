import {
  HOME_HUB_DAILY_MASS_WIDTH_CLASS,
  HOME_HUB_PANEL_CLASS,
} from "@/components/HomeHubButton";
import Link from "next/link";
import type { ReaderDisplay } from "@/lib/reader-display";

type Props = { reader: ReaderDisplay };

export function BibleReaderNotice({ reader }: Props) {
  if (reader.mode === "guest") {
    return (
      <p className={`${HOME_HUB_DAILY_MASS_WIDTH_CLASS} ${HOME_HUB_PANEL_CLASS} bg-white`}>
        Sign in with a{" "}
        <Link href="/account/login" className="font-semibold text-[var(--color-link)]">
          family account
        </Link>{" "}
        or{" "}
        <Link href="/reader/login" className="font-semibold text-[var(--color-link)]">
          Access ID
        </Link>{" "}
        to save praise stickers as you type each chapter.
      </p>
    );
  }

  const label =
    reader.mode === "sub"
      ? reader.displayName
      : reader.displayName || reader.email || "Parent";

  return (
    <p className={`${HOME_HUB_DAILY_MASS_WIDTH_CLASS} text-sm text-[var(--color-muted)]`}>
      Signed in as <strong className="text-[var(--color-ink)]">{label}</strong>
      {reader.mode === "owner" ? " (parent)" : " (reader)"}.{" "}
      <Link href="/reader/login" className="font-semibold text-[var(--color-link)]">
        Switch reader
      </Link>
    </p>
  );
}
