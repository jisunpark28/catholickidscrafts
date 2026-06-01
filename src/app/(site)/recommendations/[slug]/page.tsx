import { ContentBody } from "@/components/ContentBody";
import { PageShell } from "@/components/PageShell";
import { kindLabel } from "@/lib/recommendation-types";
import { getRecommendationBySlug } from "@/lib/recommendations";
import { youtubeVideoId } from "@/lib/youtube";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getRecommendationBySlug(slug);
  if (!item) return { title: "Not found" };
  return { title: item.title, description: item.excerpt || item.title };
}

export default async function RecommendationDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getRecommendationBySlug(slug);
  if (!item) notFound();

  const videoId = item.kind === "VIDEO" ? youtubeVideoId(item.externalUrl) : null;

  return (
    <PageShell>
      <Link
        href="/recommendations"
        className="text-sm font-semibold text-[var(--color-link)] hover:underline"
      >
        ← Recommendations
      </Link>

      <p className="mt-6 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
        {kindLabel(item.kind)}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-[var(--color-ink)]">{item.title}</h1>
      {item.author && <p className="mt-2 text-lg text-[var(--color-muted)]">by {item.author}</p>}
      {item.excerpt && <p className="mt-4 text-lg text-[var(--color-muted)]">{item.excerpt}</p>}

      {videoId && (
        <div className="mt-8 aspect-video w-full max-w-3xl border border-[var(--color-border)] bg-black">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {item.imageUrl && !videoId && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt=""
          className="mt-8 max-h-80 w-auto border border-[var(--color-border)]"
        />
      )}

      <a
        href={item.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-block bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)]"
      >
        Open original link ↗
      </a>

      {item.description && (
        <ContentBody
          content={item.description}
          contentFormat="html"
          className="mt-10 border border-[var(--color-border)] bg-white px-6 py-8 sm:px-10"
        />
      )}

      {item.tags && (
        <p className="mt-6 text-sm text-[var(--color-muted)]">
          <span className="font-semibold text-[var(--color-ink)]">Tags:</span> {item.tags}
        </p>
      )}
    </PageShell>
  );
}
