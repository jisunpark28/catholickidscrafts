import { ExternalLink } from "@/components/ExternalLink";
import { kindLabel, type RecommendationItem } from "@/lib/recommendation-types";
import { isAmazonAffiliateLink } from "@/lib/external-links";
import Link from "next/link";

type Props = { item: RecommendationItem };

export function RecommendationCard({ item }: Props) {
  const affiliate = isAmazonAffiliateLink(item.linkType, item.externalUrl);

  return (
    <article className="border border-[var(--color-border)] bg-white p-5 transition hover:border-[var(--color-accent)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="bg-[var(--color-surface)] px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
          {kindLabel(item.kind)}
        </span>
        {affiliate && (
          <span className="text-xs font-semibold text-[var(--color-muted)]">Amazon</span>
        )}
        {item.tags && (
          <span className="text-xs text-[var(--color-muted)]">{item.tags}</span>
        )}
      </div>
      <h2 className="mt-3 text-lg font-bold text-[var(--color-ink)]">
        <Link href={`/recommendations/${item.slug}`} className="hover:text-[var(--color-accent)]">
          {item.title}
        </Link>
      </h2>
      {item.author && (
        <p className="mt-1 text-sm text-[var(--color-muted)]">by {item.author}</p>
      )}
      {item.excerpt && (
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{item.excerpt}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
        <Link href={`/recommendations/${item.slug}`} className="text-[var(--color-link)]">
          Details →
        </Link>
        <ExternalLink
          href={item.externalUrl}
          linkType={item.linkType}
          className="text-[var(--color-accent)]"
        >
          Open link ↗
        </ExternalLink>
      </div>
    </article>
  );
}
