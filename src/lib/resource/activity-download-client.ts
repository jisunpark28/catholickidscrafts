// Client: downloads an activity PDF through the signed-in API route (no public file URL).
import { activityDownloadPath, activityFileName, type ActivityVariant } from "@/lib/resource/activities";

export class ActivityDownloadError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function saveActivityPdf(slug: string, variant: ActivityVariant): Promise<void> {
  const res = await fetch(activityDownloadPath(slug, variant), { credentials: "same-origin", cache: "no-store" });
  if (!res.ok) {
    const msg =
      res.status === 401
        ? "Please sign in to download this sheet."
        : res.status === 403
          ? "Grown-ups only: sign in with Google again to return to the parent account."
          : res.status === 429
            ? "Too many downloads. Please try again later."
            : res.status === 404
              ? "This sheet is not available to download yet."
              : "Could not get this sheet right now. Please try again.";
    throw new ActivityDownloadError(msg, res.status);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = activityFileName({ slug }, variant);
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
