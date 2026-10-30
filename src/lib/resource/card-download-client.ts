// Client helpers for the card PNG: Download saves a real .png, Share sends the PNG file when the
// browser allows it. A failed request never turns into a saved file (no "download.json").
import { cardDownloadPath, cardFileName, type PictureCard } from "./card-meta";

type CardRef = Pick<PictureCard, "id" | "title">;

/** Full-size 1080x1350 PNG from the gated API, or an Error with a short message for a toast. */
export async function fetchCardPng(card: CardRef, inline = false): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch(`${cardDownloadPath(card.id)}${inline ? "?inline=1" : ""}`, {
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new Error("Could not reach the site. Please try again.");
  }
  const type = (res.headers.get("content-type") ?? "").toLowerCase();
  if (!res.ok || !type.startsWith("image/png")) {
    if (res.status === 401) throw new Error("Please sign in to download this card.");
    if (res.status === 402) throw new Error("Card downloads are a Plus feature.");
    if (res.status === 429) throw new Error("Too many downloads. Please try again later.");
    if (res.status === 404) throw new Error("This card is not available to download yet.");
    throw new Error("Could not get this card right now. Please try again.");
  }
  const blob = await res.blob();
  return blob.type === "image/png" ? blob : new Blob([blob], { type: "image/png" });
}

/** Saves the card as <catholickidscrafts-ID-title>.png. Throws (nothing is saved) on any error. */
export async function saveCardPng(card: CardRef): Promise<void> {
  const blob = await fetchCardPng(card, false);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = cardFileName(card);
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Native share sheet with the PNG file attached when the browser supports file sharing,
 * otherwise just the link. Returns false when the user cancelled.
 */
export async function shareCardPng(card: CardRef, link: { url: string; text: string }): Promise<boolean> {
  let data: ShareData = { title: card.title, text: link.text, url: link.url };
  try {
    const blob = await fetchCardPng(card, true);
    const file = new File([blob], cardFileName(card), { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) data = { ...data, files: [file] };
  } catch {
    // No PNG (offline, not available yet): share the link only.
  }
  try {
    await navigator.share(data);
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return false;
    throw e instanceof Error ? e : new Error("Share failed.");
  }
}