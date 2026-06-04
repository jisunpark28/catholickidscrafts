import {
  RECOMMENDED_SCRIPTURE_SITES,
  scriptureSiteHrefForDate,
  type ScriptureSiteLink,
} from "@/lib/scripture-links";

type Props = {
  /** When set, Living with Christ & USCCB buttons open that liturgical day. */
  dateKey?: string;
  title?: string;
  compact?: boolean;
};

export function RecommendedScriptureSites({
  dateKey,
  title = "Official reading & Bible sites",
  compact = false,
}: Props) {
  return (
    <section
      className={`border border-[var(--color-border)] bg-[var(--color-surface)] ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <h2 className={`font-bold text-[var(--color-ink)] ${compact ? "text-sm" : "text-lg"}`}>
        {title}
      </h2>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Opens the publisher or bishops&apos; site in a new tab. Reading text stays on their
        servers—we do not copy it here.
      </p>
      <ul className={`mt-4 flex flex-col ${compact ? "gap-2" : "gap-3"}`}>
        {RECOMMENDED_SCRIPTURE_SITES.map((site) => (
          <SiteButton key={site.id} site={site} dateKey={dateKey} compact={compact} />
        ))}
      </ul>
    </section>
  );
}

function SiteButton({
  site,
  dateKey,
  compact,
}: {
  site: ScriptureSiteLink;
  dateKey?: string;
  compact: boolean;
}) {
  const href =
    dateKey && site.dated ? scriptureSiteHrefForDate(site, dateKey) : site.href;
  const datedLabel =
    dateKey && site.dated
      ? site.dated === "lwc-reading"
        ? " (this date)"
        : " (this date)"
      : "";

  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex flex-col border border-[var(--color-border)] bg-white transition hover:border-[var(--color-accent)] hover:bg-white ${
          compact ? "px-3 py-2" : "px-4 py-3"
        }`}
      >
        <span className="text-sm font-bold text-[var(--color-ink)]">
          {site.label}
          {datedLabel}
          <span className="ml-1 font-normal text-[var(--color-muted)]">↗</span>
        </span>
        {!compact && (
          <span className="mt-1 text-xs text-[var(--color-muted)]">{site.description}</span>
        )}
      </a>
    </li>
  );
}
