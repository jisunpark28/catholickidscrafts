import { HomeFeatureCarousel, type HomeFeatureSlide, type HomeLeadSlide } from "@/components/home/HomeFeatureCarousel";
import { HomeBackdrop } from "@/components/home/HomeBackdrop";
import { HomePdfShell } from "@/components/home/HomePdfShell";
import { SundaySheetHero } from "@/components/home/SundaySheetHero";
import { emailConfigured } from "@/lib/email";
import { loadHomeSundaySheet } from "@/lib/home-sunday-sheet";
import { getPublicContactEmail } from "@/lib/site-contact";
import { buildHomePdfNav } from "@/lib/home-pdf-nav";
import { getPublishedHomeSections } from "@/lib/home-sections";
import { currentSeasonHref } from "@/lib/liturgy-season-href";
import { pageMetadata } from "@/lib/site-metadata";
import { LITURGY_TOPIC_LABELS, isLiturgyTopic } from "@/lib/liturgy-topics";
import { SITE_DESCRIPTION, worksheetNode } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { copyText, getSiteCopyMap } from "@/lib/site-copy";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Catholic Kids Crafts | Free Mass, Bible & Prayer Activities",
  absoluteTitle: true,
  description: SITE_DESCRIPTION,
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
  /** Browser-frame address; defaults to catholickidscrafts.com + href when omitted. */
  frameUrl?: string;
};

const FEATURES: Feature[] = [
  {
    id: "gospel",
    href: "/bible/gospel",
    image: "/home-features/gospel.webp",
    icon: "📖",
    color: "#d35400",
    tint: "#fde7d6",
    title: "Today's Gospel Typing",
    hook: "Hear Jesus speak, one word at a time.",
    description: "Type today's short Gospel passage word by word and let the Word sink into your child's heart.",
    benefits: ["New Gospel every day", "Praise stickers on a calendar"],
    badge: "⭐ Sign in to collect stickers",
    cta: "Start typing",
  },
  {
    id: "bible",
    href: "/bible/read/genesis/1",
    image: "/home-features/bible.webp",
    icon: "💝",
    color: "#a87b00",
    tint: "#fdf3c7",
    title: "Mom's Bible",
    hook: "A color-coded Prayer Bible from Mom & Dad.",
    description:
      "Tap any verse to highlight in 4 pastel themes—Love, Wisdom, Courage, or Prayer—and leave a warm note in the margin for your child to discover.",
    benefits: [
      "4 color-coded themes (🟡 Love · 🟢 Wisdom · 🔵 Courage · 🩷 Prayer)",
      '"When my child is..." verse finder for real-life moments',
      "10-second Prayer Starter chips for busy parents",
    ],
    badge: "🩷 Mom's Prayer for You",
    cta: "Open Mom's Bible",
    frameUrl: "catholickidscrafts.com/bible/read/psalms/34",
  },
  {
    id: "memos",
    href: "/bible/read/genesis/1",
    image: "/home-features/memos.webp",
    icon: "💌",
    color: "#2e8b57",
    tint: "#e0f2e9",
    title: "Shared Faith Notes",
    hook: "From yellow treasure stamps to a printed keepsake book.",
    description:
      "Your child follows yellow stamps (💌 Waiting for You!) to read your notes, replies with 1-click stickers, and you can print it all as a keepsake PDF book for First Communion or birthdays.",
    benefits: [
      "1-Click kid sticker replies (❤️ Love you, Mom! · 🙏 Amen!)",
      "Separate Mom & Dad tabs for family co-parenting",
      'Print as a "Mom\'s Prayer Bible for My Child" PDF booklet',
    ],
    badge: "🌱 Shared Together",
    cta: "See sample & print preview",
    frameUrl: "catholickidscrafts.com/print/moms-bible/mia",
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
    description: "Interactive Catholic games for kids: Come to Mass!, liturgical vestments, Bible hangman, and more.",
    benefits: ["Safe & ad-free for kids", "Photos stay on your device"],
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
    description: "Step-by-step flip cards for the Sign of the Cross, Our Father, Hail Mary, and more in 10 languages.",
    benefits: ["Prayer flip cards", "Tap to pray together"],
    badge: "🙏 Pray together",
    cta: "Pray together",
  },
  {
    id: "liturgy",
    href: "/liturgy/ordinary-time",
    image: "/home-features/liturgy.webp",
    icon: "⛪",
    color: "#c0392b",
    tint: "#fbe4e4",
    title: "Liturgical Year",
    hook: "Celebrate every season of the Church.",
    description:
      "Kid-friendly questions and answers, crafts, and activities for Advent, Christmas, Lent, Easter, and Ordinary Time.",
    benefits: ["6 liturgical seasons", "Kid Q&A flip cards", "Follows the Church calendar"],
    badge: "✂️ Season activities",
    cta: "Explore the seasons",
  },
];

export default async function HomePage() {
  const [copy, sections, sheet] = await Promise.all([
    getSiteCopyMap(),
    getPublishedHomeSections(),
    loadHomeSundaySheet(),
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
  const seasonSlug = seasonHref.replace("/liturgy/", "");
  const seasonLabel = isLiturgyTopic(seasonSlug) ? LITURGY_TOPIC_LABELS[seasonSlug] : "seasonal";
  const slides: HomeFeatureSlide[] = FEATURES.map((f) => {
    const title = copyText(copy, `home.features.${f.id}.title`, f.title);
    const href = f.href;
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
      frameUrl: f.frameUrl ?? `catholickidscrafts.com${href}`,
    };
  });

  const emailEnabled = emailConfigured();
  const lead: HomeLeadSlide | null = sheet
    ? {
        id: "sunday-sheet",
        title: sheet.title,
        chipLabel: copyText(copy, "home.features.sheet.chip", "Sunday Sheet"),
        icon: "🖨",
        color: "#2e7d32",
        tint: "#fff3e6",
        content: (
          <SundaySheetHero
            position={`1 / ${FEATURES.length + 1}`}
            slug={sheet.slug}
            title={sheet.title}
            liturgicalName={sheet.liturgicalName}
            sundayLabel={sheet.sundayLabel}
            gospelRef={sheet.gospelRef}
            printBasePath={sheet.printBasePath}
            editBasePath={sheet.key ? `/resource/edit/${sheet.slug}` : null}
            seasonHref={seasonHref}
            seasonLabel={seasonLabel}
            groupInquiryHref={groupInquiryHref}
            emailEnabled={emailEnabled}
          />
        ),
      }
    : null;

  return (
    <HomePdfShell groups={groups} dailyMassLabel={copyText(copy, "home.hub.cta_mass", "Daily Mass")}>
      {sheet ? (
        <JsonLd
          nodes={[
            worksheetNode({
              name: sheet.title,
              gospelRef: sheet.gospelRef,
              description: `Free printable Sunday Gospel sheet for ${sheet.liturgicalName} (${sheet.gospelRef}), in two levels.`,
              pagePath: "/",
              isAccessibleForFree: true,
            }),
          ]}
        />
      ) : null}
      <h1 className="sr-only">
        {copyText(copy, "home.hub.title", "Catholic crafts, prayers, and games for kids")}
      </h1>
      <p className="sr-only">
        {copyText(copy, "home.hub.subtitle", "Free liturgical activities for catechists and parents.")}
      </p>
      <div className="relative isolate pb-16 pt-6 sm:pt-8">
        <HomeBackdrop />
      <HomeFeatureCarousel
        eyebrow={copyText(copy, "home.features.heading", "What you can do here")}
        heading={copyText(copy, "home.features.headline", "Faith fun & lasting memories for every week")}
        subtitle={copyText(copy, "home.features.subtitle", "Print, pray, highlight, and play. Built for Catholic families.")}
        lead={lead}
        slides={slides}
        prevLabel={copyText(copy, "home.features.prev", "Previous feature")}
        nextLabel={copyText(copy, "home.features.next", "Next feature")}
      />
      </div>
    </HomePdfShell>
  );
}
