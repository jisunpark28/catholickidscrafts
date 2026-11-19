// Related worksheet for a picture card, from existing data only (server-side; never invented):
// Saint cards -> Saint Report Worksheet; evergreen catalog relatedCardIds / card sheetKeys ->
// Mass or Virtue Challenge worksheet; same-title printable activity; card sheetKeys -> Sunday sheet.
import { publicPath, EVERGREEN_PAGES } from "@/lib/evergreen-catalog";
import { activityPath, getActivity, RESOURCE_ACTIVITIES, SAINT_REPORT_SLUG } from "@/lib/resource/activities";
import type { PictureCard } from "@/lib/resource/card-meta";
import { sundayMassWorksheetPath } from "@/lib/seo/sunday-mass-worksheets";
import { getSundaySheet } from "@/lib/sunday-sheet-content";

export type CardRelatedWorksheet = {
  title: string;
  href: string;
  /** "Activity sheet", "Sunday Mass worksheet", … */
  label: string;
  /** Public low-resolution preview image (activities only; worksheets have no static preview). */
  image?: string;
  /** Download gate of the linked activity ("signin" free with sign-in, "plus" Plus only). */
  access?: "signin" | "plus";
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const ACTIVITY_BY_TITLE = new Map(RESOURCE_ACTIVITIES.map((a) => [norm(a.title), a]));

function activityWorksheet(slug: string): CardRelatedWorksheet | null {
  const a = getActivity(slug);
  if (!a) return null;
  return { title: a.title, href: activityPath(a.slug), label: a.kind, image: a.previews.color, access: a.access };
}

/** Saint Report Worksheet (shown on every saint card). */
export function saintReportWorksheet(): CardRelatedWorksheet | null {
  return activityWorksheet(SAINT_REPORT_SLUG);
}

export function relatedWorksheetForCard(card: PictureCard): CardRelatedWorksheet | null {
  if (card.cat === "Saint") return saintReportWorksheet();
  const keys = card.sheetKeys ?? [];
  const evergreen = EVERGREEN_PAGES.find((p) => p.relatedCardIds.includes(card.id) || keys.includes(p.key));
  if (evergreen) {
    return {
      title: `${evergreen.name} worksheet`,
      href: publicPath(evergreen),
      label: evergreen.kind === "mass" ? "Mass worksheet" : "Virtue Challenge worksheet",
    };
  }
  const activity = ACTIVITY_BY_TITLE.get(norm(card.title));
  if (activity) return activityWorksheet(activity.slug);
  for (const key of keys) {
    const sheet = getSundaySheet(key);
    if (sheet) return { title: sheet.liturgicalName, href: sundayMassWorksheetPath(key), label: "Sunday Mass worksheet" };
  }
  return null;
}

/** Non-saint cards with a related worksheet, keyed by card id (saints all share the Saint Report Worksheet). */
export function relatedWorksheetsById(cards: readonly PictureCard[]): Record<string, CardRelatedWorksheet> {
  const out: Record<string, CardRelatedWorksheet> = {};
  for (const c of cards) {
    if (c.cat === "Saint") continue;
    const r = relatedWorksheetForCard(c);
    if (r) out[c.id] = r;
  }
  return out;
}
