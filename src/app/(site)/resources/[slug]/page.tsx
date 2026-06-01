import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentBody } from "@/components/ContentBody";
import { PageShell } from "@/components/PageShell";
import { TptCta } from "@/components/TptCta";
import { resolveAssetUrl } from "@/lib/asset-url";
import { getLiturgicalPeriod, getResourceBySlug } from "@/lib/content";
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

  return (
    <PageShell>
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

      {post.downloadUrl && (
        <a
          href={post.downloadUrl}
          className="mt-8 inline-block bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)]"
          download
        >
          {post.downloadLabel ?? "Download free sample"}
        </a>
      )}

      <ContentBody
        content={post.content}
        contentFormat={post.contentFormat}
        className="mt-10 border border-[var(--color-border)] bg-white px-6 py-8 sm:px-10"
      />
    </PageShell>
  );
}
