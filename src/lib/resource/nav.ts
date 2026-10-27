import { buildHomePdfNav } from "@/lib/home-pdf-nav";
import { getPublishedHomeSections } from "@/lib/home-sections";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";

/** Same sidebar groups and Daily Mass label as /daily-mass. */
export async function getResourceNav() {
  const [copy, sections] = await Promise.all([getSiteCopyMap(), getPublishedHomeSections()]);
  const { groups } = buildHomePdfNav(sections, {
    gallery: "Gallery",
    curriculum: copyText(copy, "global.nav.curriculum", "Curriculum"),
    resources: copyText(copy, "home.hub.cta_resources", "Kids Resources"),
    play: copyText(copy, "global.nav.play_learn", "Play & Learn"),
  });
  return { groups, dailyMassLabel: copyText(copy, "home.hub.cta_mass", "Daily Mass") };
}
