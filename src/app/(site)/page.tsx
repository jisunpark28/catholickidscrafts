import { HomeFeatureCarousel, type HomeFeatureSlide, type HomeLeadSlide } from "@/components/home/HomeFeatureCarousel";
import { HomePdfShell } from "@/components/home/HomePdfShell";
import { SundaySheetHero } from "@/components/home/SundaySheetHero";
import { emailConfigured } from "@/lib/email";
import { loadFeaturedSheet } from "@/lib/gospel-sheet";
import { getPublicContactEmail } from "@/lib/site-contact";
import { buildHomePdfNav } from "@/lib/home-pdf-nav";
import { getPublishedHomeSections } from "@/lib/home-sections";
import { currentSeasonHref } from "@/lib/liturgy-season-href";
import { pageMetadata } from "@/lib/site-metadata";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Catholic Kids Crafts – Mass, Bible & Prayer Activities",
  absoluteTitle: true,
  description:
    "Free Catholic activities for kids: today's Gospel, Bible typing, prayers, Mass games and liturgical year lessons for parents and Sunday school catechists.",
  path: "/",
});

export const dynamic = "force-dynamic";

type Feature = {
  id: string;
  href: string;
  image: string;
  icon: string;
  color: string;
  tint: string;
  title: string;
  hook: string;
  description: string;
  benefits: string[];
  badge?: string;
  cta: string;
};

const FEATURES: Feature[] = [
  {
    id: "gospel",
    href: "/gospel",
    image: "/home-features/gospel.webp",
    icon: "📖",
    color: "#d35400",
    tint: "#fde7d6",
    title: "Today's Gospel Typing",
    hook: "Hear Jesus speak, one word at a time.",
    description: "Type today's Gospel word by word and let the Word sink in.",
    benefits: ["New Gospel every day", "Praise stickers on a calendar"],
    badge: "⭐ Sign in to collect stickers",
    cta: "Start typing",
  },
  {
    id: "bible",
    href: "/bible/genesis",
    image: "/home-features/bible.webp",
    icon: "⭐",
    color: "#a87b00",
    tint: "#fdf3c7",
    title: "Bible Typing",
    hook: "Type your way through the whole Bible!",
    description: "Type the whole Bible chapter by chapter and collect a sticker for every chapter.",
    benefits: ["Old & New Testament", "A sticker every chapter", "Many languages"],
    badge: "⭐ Sign in to collect stickers",
    cta: "Open the Bible",
  },
  {
    id: "memos",
    href: "/bible/read/matthew/5",
    image: "/home-features/memos.webp",
    icon: "📝",
    color: "#2e8b57",
    tint: "#e0f2e9",
    title: "Bible Memos",
    hook: "Keep the verses that touch your heart.",
    description: "Leave a note on your favourite passages and come back to them anytime.",
    benefits: ["Notes on any chapter"],
    badge: "💚 My favourite verse",
    cta: "Try memos",
  },
  {
    id: "play",
    href: "/play",
    image: "/home-features/play.webp",
    icon: "🎲",
    color: "#3b6fd8",
    tint: "#e3ecfb",
    title: "Play & Learn",
    hook: "Learn the faith by playing!",
    description: "Faith games for kids: Come to Mass!, liturgical vestments, hangman and more.",
    benefits: ["Ages & play time on every game", "Photos stay on your device"],
    badge: "🎉 Faith games",
    cta: "Play now",
  },
  {
    id: "prayers",
    href: "/prayers",
    image: "/home-features/prayers.webp",
    icon: "🙏",
    color: "#8e44ad",
    tint: "#f3e5f5",
    title: "Prayers",
    hook: "Learn to pray, one prayer at a time.",
    description: "Flip cards for the Sign of the Cross, Our Father, Hail Mary and more, plus every prayer in 10 languages.",
    benefits: ["Prayer flip cards", "10 languages"],
    badge: "🙏 Pray together",
    cta: "Pray together",
  },
  {
    id: "liturgy",
    href: "/liturgy/ordinary-time", // replaced with the current season at request time
    image: "/home-features/liturgy.webp",
    icon: "⛪",
    color: "#c0392b",
    tint: "#fbe4e4",
    title: "Liturgical Year",
    hook: "Celebrate every season of the Church.",
    description: "Kid questions and answers, crafts and activities for Advent, Christmas, Lent, Easter and Ordinary Time.",
    benefits: ["6 seasons", "Q&A flip cards", "Follows the Church calendar"],
    badge: "✂️ Season activities",
    cta: "Explore the seasons",
  },
];

export default async function HomePage() {
  const [copy, sections, sheet] = await Promise.all([
    getSiteCopyMap(),
    getPublishedHomeSections(),
    loadFeaturedSheet(),
  ]);
  const contactEmail = getPublicContactEmail();
  const groupInquiryHref = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent("Group / parish inquiry")}`
    : null;

  const { groups } = buildHomePdfNav(sections, {
    gallery: "Gallery",
    curriculum: copyText(copy, "global.nav.curriculum", "Curriculum"),
    resources: copyText(copy, "home.hub.cta_resources", "Kids Resources"),
    play: copyText(copy, "global.nav.play_learn", "Play & Learn"),
  });

  const seasonHref = currentSeasonHref();
  const slides: HomeFeatureSlide[] = FEATURES.map((f) => {
    const title = copyText(copy, `home.features.${f.id}.title`, f.title);
    const href = f.id === "liturgy" ? seasonHref : f.href;
    return {
      id: f.id,
      href,
      image: f.image,
      icon: f.icon,
      color: f.color,
      tint: f.tint,
      title,
      hook: copyText(copy, `home.features.${f.id}.hook`, f.hook),
      description: copyText(copy, `home.features.${f.id}.description`, f.description),
      benefits: f.benefits,
      badge: f.badge,
      cta: copyText(copy, `home.features.${f.id}.cta`, f.cta),
      imageAlt: `${title} screenshot`,
      frameUrl: `catholickidscrafts.com${href}`,
    };
  });

  const emailEnabled = emailConfigured();
  const lead: HomeLeadSlide | null = sheet
    ? {
        id: "sunday-sheet",
        title: sheet.levels.level1.title || sheet.liturgicalName,
        chipLabel: copyText(copy, "home.features.sheet.chip", "Sunday Sheet"),
        icon: "🖨",
        color: "#2e7d32",
        tint: "#fff3e6",
        content: (
          <SundaySheetHero
            position={`1 / ${FEATURES.length + 1}`}
            slug={sheet.slug}
            title={sheet.levels.level1.title || sheet.liturgicalName}
            liturgicalName={sheet.liturgicalName}
            sundayLabel={sheet.sundayLabel}
            gospelRef={sheet.gospelRef}
            groupInquiryHref={groupInquiryHref}
            emailEnabled={emailEnabled}
          />
        ),
      }
    : null;

  return (
    <HomePdfShell groups={groups} dailyMassLabel={copyText(copy, "home.hub.cta_mass", "Daily Mass")}>
      <h1 className="sr-only">
        {copyText(copy, "home.hub.title", "Catholic crafts, prayers, and games for kids")}
      </h1>
      <p className="sr-only">
        {copyText(copy, "home.hub.subtitle", "Free liturgical activities for catechists and parents.")}
      </p>
      <HomeFeatureCarousel
        eyebrow={copyText(copy, "home.features.heading", "What you can do here")}
        heading={copyText(copy, "home.features.headline", "Faith fun for every week")}
        subtitle={copyText(copy, "home.features.subtitle", "Print, pray, type and play. Free for families and catechists.")}
        lead={lead}
        slides={slides}
        prevLabel={copyText(copy, "home.features.prev", "Previous feature")}
        nextLabel={copyText(copy, "home.features.next", "Next feature")}
      />
    </HomePdfShell>
  );
}
