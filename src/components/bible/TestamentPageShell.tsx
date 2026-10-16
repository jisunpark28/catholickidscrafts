import { HomePdfShell } from "@/components/home/HomePdfShell";
import { buildHomePdfNav } from "@/lib/home-pdf-nav";
import { getPublishedHomeSections } from "@/lib/home-sections";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";

type Props = {
  children: React.ReactNode;
};

/** Homepage sidebar (Bible + Liturgy) around an Old or New Testament page. */
export async function TestamentPageShell({ children }: Props) {
  const [sections, copy] = await Promise.all([getPublishedHomeSections(), getSiteCopyMap()]);
  const { groups } = buildHomePdfNav(sections, {
    gallery: "Gallery",
    curriculum: copyText(copy, "global.nav.curriculum", "Curriculum"),
    resources: copyText(copy, "home.hub.cta_resources", "Kids Resources"),
    play: copyText(copy, "global.nav.play_learn", "Play & Learn"),
  });

  return <HomePdfShell groups={groups}>{children}</HomePdfShell>;
}
