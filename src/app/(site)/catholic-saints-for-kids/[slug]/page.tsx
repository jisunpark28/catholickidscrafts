import { HomePdfShell } from "@/components/home/HomePdfShell";
import { ShareToClassroomButton } from "@/components/ShareToClassroomButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { SaintStoryPanel } from "@/components/seo/SaintStoryPanel";
import { cardSharePath } from "@/lib/resource/card-meta";
import {
  getSaintSeoCard,
  SAINTS_HUB,
  SAINT_SEO_CARDS,
  saintFactBox,
  saintIndexableTitle,
  saintMetaDescription,
  saintPageSeo,
} from "@/lib/seo/card-seo";
import { pinOgImage } from "@/lib/seo/pin-og";
import { toSaintStoryView } from "@/lib/seo/saint-story-view";
import { pageMetadata } from "@/lib/site-metadata";
import {
  absoluteSiteUrl,
  breadcrumbNode,
  organizationId,
  SITE_NAME,
  type JsonLdNode,
} from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SAINT_SEO_CARDS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = getSaintSeoCard(slug);
  if (!card) return {};
  const seo = saintPageSeo(card);
  const path = `${SAINTS_HUB}/${card.slug}`;
  const description = saintMetaDescription(card);
  if (saintFactBox(card)) {
    // Indexable: keyword title used as-is (no site suffix) so it stays within ~60 characters.
    const title = saintIndexableTitle(card);
    return pageMetadata({
      title,
      absoluteTitle: true,
      description,
      path,
      image: pinOgImage("saint", card.slug, title),
    });
  }
  // No Fact Box yet: keep the page reachable for visitors but out of the index and sitemap.
  return pageMetadata({
    title: seo.seoTitle,
    description,
    path,
    robots: { index: false, follow: true },
    image: pinOgImage("saint", card.slug, seo.seoTitle),
  });
}

function learningNode(name: string, description: string, pagePath: string, about: string): JsonLdNode {
  return {
    "@type": "LearningResource",
    name,
    description,
    learningResourceType: "Saint biography for children",
    educationalLevel: ["Elementary School", "Parents"],
    about: { "@type": "Person", name: about },
    isAccessibleForFree: true,
    inLanguage: "en",
    url: absoluteSiteUrl(pagePath),
    author: { "@type": "Organization", name: SITE_NAME, url: absoluteSiteUrl("/") },
    provider: { "@id": organizationId() },
  };
}

export default async function CatholicSaintPage({ params }: Props) {
  const { slug } = await params;
  const card = getSaintSeoCard(slug);
  if (!card) notFound();
  const seo = saintPageSeo(card);
  const description = saintMetaDescription(card);
  const path = `${SAINTS_HUB}/${card.slug}`;
  const story = toSaintStoryView(card);

  return (
    <HomePdfShell groups={[]}>
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Catholic Saints for Kids", path: SAINTS_HUB },
            { name: card.title, path },
          ]),
          learningNode(seo.h1, description, path, card.title),
        ]}
      />
      <SaintStoryPanel
        story={story}
        canPreview
        back={
          <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
            <Link href="/" className="text-[#335599] hover:underline">
              Home
            </Link>{" "}
            ›{" "}
            <Link href={SAINTS_HUB} className="text-[#335599] hover:underline">
              Catholic Saints for Kids
            </Link>{" "}
            › {card.title}
          </nav>
        }
        actions={
          <div className="flex flex-col gap-2">
            <Link
              href={cardSharePath(card.id)}
              className="flex items-center justify-center gap-1.5 rounded-full border border-[#c9773a] bg-white px-3 py-1.5 text-sm font-semibold text-[#9a4f1c] no-underline hover:bg-[#fff8f0]"
            >
              <span aria-hidden="true">🖨️</span> Print / Save Saint Card
            </Link>
            <ShareToClassroomButton className="w-full justify-center" />
          </div>
        }
        showNewsletter
        showHubLink
        quickFacts
      />
    </HomePdfShell>
  );
}
