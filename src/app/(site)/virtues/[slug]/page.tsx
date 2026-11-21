import { TestamentPageShell } from "@/components/bible/TestamentPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { VirtueCarousel } from "@/components/virtues/VirtueCarousel";
import { getVirtue } from "@/lib/virtues";
import { resolveResourceViewer } from "@/lib/resource/resolve-access";
import { getEvergreenSheet } from "@/lib/seo/evergreen-worksheets";
import { pageMetadata } from "@/lib/site-metadata";
import { breadcrumbNode } from "@/lib/structured-data";
import { toGospelSheetView } from "@/lib/sunday-sheet-content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const virtue = getVirtue(slug);
  if (!virtue) return { title: "Virtues" };
  return pageMetadata({
    title: `${virtue.name} for Catholic Kids`,
    description: `${virtue.name} for Catholic kids: Bible stories, the verse “${virtue.keyVerse.text}” and a worksheet to practice at home.`,
    path: `/virtues/${virtue.slug}`,
  });
}

export default async function VirtuePage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const virtue = getVirtue(slug);
  if (!virtue) notFound();
  const raw = query.slide;
  const slide = Number(Array.isArray(raw) ? raw[0] : raw);
  let isPlus = false;
  try {
    isPlus = (await resolveResourceViewer()).isPlus;
  } catch {
    isPlus = false;
  }
  const content = getEvergreenSheet(virtue.worksheet.key);
  const sheet = content
    ? { ...toGospelSheetView(content), sundayLabel: content.liturgicalName, slug: virtue.worksheet.slug }
    : null;

  return (
    <TestamentPageShell>
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Virtues", path: "/virtues" },
            { name: virtue.name, path: `/virtues/${virtue.slug}` },
          ]),
        ]}
      />
      <article className="sr-only">
        <h1>{virtue.name}</h1>
        {virtue.stories.map((story) => (
          <p key={story.ref}>
            {story.ref}. {story.summary}
          </p>
        ))}
        <p>
          {virtue.keyVerse.ref}. {virtue.keyVerse.text}
        </p>
      </article>
      <VirtueCarousel virtue={virtue} isPlus={isPlus} sheet={sheet} initialSlide={Number.isFinite(slide) ? slide : 0} />
    </TestamentPageShell>
  );
}
