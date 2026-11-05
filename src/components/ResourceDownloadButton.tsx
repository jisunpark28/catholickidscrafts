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
      className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)] hover:text-white"
      onClick={() => recordResourceView(slug)}
    >
      <DownloadIcon className="h-4 w-4" />
      {label}
    </a>
  );
}
