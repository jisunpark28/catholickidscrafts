import { revalidatePath } from "next/cache";

/**
 * Public pages are cached (ISR). Admin saves call these so changes show right away
 * instead of waiting for the hourly refresh.
 */

/** Liturgy cards and weekly issues render on every /liturgy/[topic] page. */
export function revalidateLiturgyPages(): void {
  revalidatePath("/liturgy/[topic]", "page");
}

/** Q&A flip cards render on /prayers, /liturgy/[topic] and the /qa-cards page. */
export function revalidateQaPages(): void {
  revalidatePath("/prayers");
  revalidatePath("/liturgy/[topic]", "page");
  revalidatePath("/qa-cards");
}