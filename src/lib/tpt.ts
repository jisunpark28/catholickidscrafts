const DEFAULT_TPT_STORE_URL =
  "https://www.teacherspayteachers.com/store/catholic-kids-crafts";

/** Catholic Kids Crafts TPT store; override with NEXT_PUBLIC_TPT_STORE_URL. */
export function getTptStoreUrl(): string {
  const url = process.env.NEXT_PUBLIC_TPT_STORE_URL?.trim();
  return url || DEFAULT_TPT_STORE_URL;
}

export function isTeachersPayTeachersUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return host === "teacherspayteachers.com" || host.endsWith(".teacherspayteachers.com");
  } catch {
    return false;
  }
}

export function isYoutubeUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return host === "youtube.com" || host === "youtu.be" || host.endsWith(".youtube.com");
  } catch {
    return false;
  }
}

/** Label for a kit/resource outbound URL so YouTube is never branded as TPT. */
export function partnerOutboundLabel(url: string): string {
  if (isTeachersPayTeachersUrl(url)) return "Full classroom pack on TPT →";
  if (isYoutubeUrl(url)) return "Watch video →";
  return "Open link →";
}
