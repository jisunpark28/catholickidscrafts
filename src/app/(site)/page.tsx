import { HomeFeatureCarousel, type HomeFeatureSlide } from "@/components/home/HomeFeatureCarousel";
import { HomePdfShell } from "@/components/home/HomePdfShell";
import { buildHomePdfNav } from "@/lib/home-pdf-nav";
import { getPublishedHomeSections } from "@/lib/home-sections";
import { canonicalForPath } from "@/lib/site-metadata";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Daily Mass, Bible reading, liturgical activities, and games for Catholic children's ministry.",
  ...canonicalForPath("/"),
};

export const dynamic = "force-dynamic";

const FEATURES: {
  id: string;
  href: string;
  image: string;
  title: string;
  description: string;
  cta: string;
}[] = [
  {
    id: "gospel",
    href: "/gospel",
    image: "/home-features/gospel.webp",
    title: "Today's Gospel Typing",
    description: "Type today's Gospel word by word and let the Word sink in.",
    cta: "Start typing",
  },
  {
    id: "bible",
    href: "/bible/genesis",
    image: "/home-features/bible.webp",
    title: "Bible Typing + Praise Stickers",
    description: "Type the whole Bible chapter by chapter and collect a sticker for every chapter.",
    cta: "Open the Bible",
  },
  {
    id: "memos",
    href: "/bible/read/matthew/5",
    image: "/home-features/memos.webp",
    title: "Chapter Memos",
    description: "Leave a note on your favourite passages and come back to them anytime.",
    cta: "Try memos",
  },
  {
    id: "curriculum",
    href: "/curriculum",
    image: "/home-features/curriculum.webp",
    title: "Catechism Curriculum",
    description: "Year-round lessons for Sunday school, grounded in the Catechism.",
    cta: "Browse lessons",
  },
  {
    id: "play",
    href: "/play",
    image: "/home-features/play.webp",
    title: "Play & Learn",
    description: "Faith games for kids: Tiny Priest, liturgical vestments, hangman and more.",
    cta: "Play now",
  },
  {
    id: "prayers",
    href: "/prayers",
    image: "/home-features/prayers.webp",
    title: "Prayers",
    description: "Learn the Sign of the Cross, Our Father, Hail Mary and more, one prayer at a time.",
    cta: "Pray together",
  },
  {
    id: "program",
    href: "/program",
    image: "/home-features/program.webp",
    title: "Lesson Kits (Custom Sheet)",
    description: "Build your own lesson kit: games, Gospel typing and crafts in one sheet.",
    cta: "Build a kit",
  },
];

export default async function HomePage() {
  const [copy, sections] = await Promise.all([getSiteCopyMap(), getPublishedHomeSections()]);

  const { groups } = buildHomePdfNav(sections, {
    gallery: "Gallery",
    curriculum: copyText(copy, "global.nav.curriculum", "Curriculum"),
    resources: copyText(copy, "home.hub.cta_resources", "Kids Resources"),
    play: copyText(copy, "global.nav.play_learn", "Play & Learn"),
  });

  const slides: HomeFeatureSlide[] = FEATURES.map((f) => {
    const title = copyText(copy, `home.features.${f.id}.title`, f.title);
    return {
      id: f.id,
      href: f.href,
      image: f.image,
      title,
      description: copyText(copy, `home.features.${f.id}.description`, f.description),
      cta: copyText(copy, `home.features.${f.id}.cta`, f.cta),
      imageAlt: `${title} screenshot`,
    };
  });

  return (
    <HomePdfShell groups={groups} dailyMassLabel={copyText(copy, "home.hub.cta_mass", "Daily Mass")}>
      <h1 className="sr-only">
        {copyText(copy, "home.hub.title", "Catholic crafts, prayers, and games for kids")}
      </h1>
      <p className="sr-only">
        {copyText(copy, "home.hub.subtitle", "Free liturgical activities for catechists and parents.")}
      </p>
      <HomeFeatureCarousel
        heading={copyText(copy, "home.features.heading", "What you can do here")}
        slides={slides}
        prevLabel={copyText(copy, "home.features.prev", "Previous feature")}
        nextLabel={copyText(copy, "home.features.next", "Next feature")}
      />
    </HomePdfShell>
  );
}
