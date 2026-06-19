"use client";

import Link from "next/link";
import type { ReaderDisplay } from "@/lib/reader-display";

type Props = { reader: ReaderDisplay };

function ReaderSignOutLink() {
  return (
    <button
      type="button"
      className="font-semibold text-[var(--color-link)]"
      onClick={() => {
        void fetch("/api/auth/reader/logout", { method: "POST" }).then(() => {
          window.location.reload();
        });
      }}
    >
      Sign out reader
    </button>
  );
}

export function ReaderStatusBar({ reader }: Props) {
  if (reader.mode === "guest") {
    return (
      <p className="mt-4 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-muted)]">
        Reading as guest on this device.{" "}
        <Link href="/reader/login" className="font-semibold text-[var(--color-link)]">
          Sign in with Access ID
        </Link>{" "}
        or{" "}
        <Link href="/account/login" className="font-semibold text-[var(--color-link)]">
          parent account
        </Link>{" "}
        to save stickers across devices.
      </p>
    );
  }

  const label =
    reader.mode === "sub"
      ? reader.displayName
      : reader.displayName || reader.email || "Parent";

  return (
    <p className="mt-4 text-sm text-[var(--color-muted)]">
      Signed in as <strong className="text-[var(--color-ink)]">{label}</strong>
      {reader.mode === "owner" ? " (parent)" : " (reader)"}. <ReaderSignOutLink />
      {" · "}
      <Link href="/reader/login" className="font-semibold text-[var(--color-link)]">
        Switch reader
      </Link>
    </p>
  );
}
