import {
  officialReadingLinksForDate,
  VATICAN_NEWS_WIDGET_EMBED,
} from "@/lib/official-reading-sources";
import { todayUniversalis } from "@/lib/dates";

type Props = {
  /** UTC midnight date used for USCCB/CBCK per-day URLs */
  date?: Date;
  className?: string;
  showVaticanNews?: boolean;
};

/**
 * Outbound links to bishops’ conferences and licensed publishers.
 * Does not embed copyrighted lectionary bodies — users read on the official site.
 */
export function OfficialReadingLinks({
  date = todayUniversalis(),
  className = "",
  showVaticanNews = false,
}: Props) {
  const links = officialReadingLinksForDate(date);

  return (
    <div className={`space-y-2 text-sm ${className}`}>
      <p className="font-semibold text-[var(--color-ink)]">Official reading sites</p>
      <ul className="list-inside list-disc space-y-1 text-[var(--color-muted)]">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--color-link)]"
              title={link.note}
            >
              {link.label} ↗
            </a>
          </li>
        ))}
        {showVaticanNews && (
          <li>
            <a
              href={VATICAN_NEWS_WIDGET_EMBED}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--color-link)]"
              title="Vatican News partner widget — Pope and Holy See news, not daily Gospel text."
            >
              Vatican News widget (embed) ↗
            </a>
          </li>
        )}
      </ul>
      <p className="text-xs leading-relaxed text-[var(--color-muted)]">
        Typing practice here uses Universalis when permitted. For official U.S. or Korean
        texts, open the links above on the bishops&apos; conference websites.
      </p>
    </div>
  );
}
