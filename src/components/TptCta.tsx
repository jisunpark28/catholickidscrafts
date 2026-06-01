import { ExternalLink } from "@/components/ExternalLink";

type Props = {
  tptUrl: string;
  isFreeSample?: boolean;
};

export function TptCta({ tptUrl, isFreeSample = true }: Props) {
  return (
    <div className="mt-8 border border-[var(--color-accent)] bg-[var(--color-surface)] px-6 py-5 sm:px-8">
      <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
        Teachers Pay Teachers
      </p>
      <p className="mt-2 text-[var(--color-ink)]">
        {isFreeSample
          ? "This page is a free preview. Get the full printable pack (all pages, answer keys, and extras) on Teachers Pay Teachers."
          : "Get this resource on Teachers Pay Teachers."}
      </p>
      <ExternalLink
        href={tptUrl}
        className="mt-4 inline-block bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)]"
        showAffiliateNote={false}
      >
        View on Teachers Pay Teachers ↗
      </ExternalLink>
    </div>
  );
}
