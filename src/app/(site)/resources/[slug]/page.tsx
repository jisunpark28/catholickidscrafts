import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentBody } from "@/components/ContentBody";
import { CraftGalleryGrid } from "@/components/CraftGalleryGrid";
import { CraftGallerySubmitForm } from "@/components/CraftGallerySubmitForm";
import { PageShell } from "@/components/PageShell";
import { ResourceDownloadButton } from "@/components/ResourceDownloadButton";
import { ResourceViewTracker } from "@/components/ResourceViewTracker";
import { TptCta } from "@/components/TptCta";
import { resolveAssetUrl } from "@/lib/asset-url";
import { getLiturgicalPeriod, getResourceBySlug } from "@/lib/content";
import { listApprovedGalleryForResourceSlug } from "@/lib/craft-gallery";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getResourceBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
    ...canonicalForPath(`/resources/${slug}`),
    openGraph: post.previewImageUrl
      ? { images: [{ url: post.previewImageUrl }] }
      : undefined,
  };
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params;
  const post = await getResourceBySlug(slug);
  if (!post) notFound();

  const period = getLiturgicalPeriod(post.liturgicalPeriod);
  const galleryItems = await listApprovedGalleryForResourceSlug(slug, 24);

  return (
    <PageShell>
      <ResourceViewTracker slug={slug} />
      <Link
        href="/resources"
        className="text-sm font-semibold text-[var(--color-link)] hover:underline"
      >
        ← Kids Resources
      </Link>
      <p className="mt-6 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
        <Link href={`/resources#${period.id}`} className="hover:text-[var(--color-accent)]">
          {period.title}
        </Link>
        {" · "}
        {post.grade} · {post.topic}
        {post.tptUrl && post.isFreeSample && (
          <>
            {" · "}
            <span className="text-[var(--color-accent)]">Free preview</span>
          </>
        )}
      </p>
      <h1 className="mt-3 text-3xl font-bold text-[var(--color-ink)]">{post.title}</h1>
      <p className="mt-4 text-lg text-[var(--color-muted)]">{post.excerpt}</p>

      {post.previewImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolveAssetUrl(post.previewImageUrl)}
          alt=""
          className="mt-8 max-h-96 w-full max-w-2xl border border-[var(--color-border)] object-cover"
        />
      )}

      {post.tptUrl && <TptCta tptUrl={post.tptUrl} isFreeSample={post.isFreeSample} />}

      {post.downloadUrl?.trim() ? (
        <div className="mt-6 flex items-center gap-3">
          <ResourceDownloadButton
            slug={slug}
            href={post.downloadUrl.trim()}
            label={post.downloadLabel?.trim() || `Download ${post.title}`}
          />
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            {post.downloadLabel?.trim() || "Download PDF"}
          </span>
        </div>
      ) : null}

      <ContentBody
        content={post.content}
        contentFormat={post.contentFormat}
        noDownloadLinks
        className="mt-10 border border-[var(--color-border)] bg-white px-6 py-8 sm:px-10"
      />

      <section className="mt-14 border-t border-[var(--color-border)] pt-10">
        <h2 className="text-xl font-bold text-[var(--color-ink)]">Family gallery</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          See what other families made—and share yours after you finish this craft.
        </p>

        <div className="mt-6 max-w-xl">
          <CraftGallerySubmitForm resourceSlug={slug} resourceTitle={post.title} />
        </div>

        {galleryItems.length > 0 ? (
          <div className="mt-10">
            <CraftGalleryGrid items={galleryItems} />
            <p className="mt-6 text-center text-sm">
              <Link href="/gallery" className="font-semibold text-[var(--color-link)]">
                View full gallery →
              </Link>
            </p>
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}
