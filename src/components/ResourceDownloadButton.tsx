"use client";

import { DownloadIcon } from "@/components/icons/DownloadIcon";
import { recordResourceView } from "@/lib/record-resource-view";

type Props = {
  slug: string;
  href: string;
  label: string;
};

export function ResourceDownloadButton({ slug, href, label }: Props) {
  return (
    <a
      href={href}
      download
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)] hover:text-white"
      aria-label={label}
      onClick={() => recordResourceView(slug)}
    >
      <DownloadIcon />
    </a>
  );
}
