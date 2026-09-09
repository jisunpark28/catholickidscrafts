import type { ResourcePost } from "@/lib/content-types";

type DownloadLabelSource = Pick<ResourcePost, "downloadLabel" | "isFreeSample">;

const GENERIC_DOWNLOAD_LABEL = /^(download( pdf)?|pdf|download file)$/i;

function isGenericDownloadLabel(label: string): boolean {
  return GENERIC_DOWNLOAD_LABEL.test(label.trim());
}

/** Visible download control text: sample/preview vs full file. */
export function resourceDownloadButtonLabel(post: DownloadLabelSource): string {
  const custom = post.downloadLabel?.trim();
  if (custom && !isGenericDownloadLabel(custom)) return custom;
  return post.isFreeSample ? "Download sample PDF" : "Download full PDF";
}
