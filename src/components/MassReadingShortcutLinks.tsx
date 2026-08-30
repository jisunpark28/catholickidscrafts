type LinkItem = { href: string; label: string };

type Props = {
  links: LinkItem[];
  className?: string;
};

const linkClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-[#e8d5c4] bg-[#faf3ec] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)] shadow-sm transition hover:border-[#dfc9b0] hover:bg-[#f5ebe0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dfc9b0]";

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden
      className="h-3.5 w-3.5 shrink-0 text-[var(--color-muted)]"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 2h4v4M14 2 8 8M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Outbound links to official daily Mass reading sites (USCCB, LWC, GoodNews). */
export function MassReadingShortcutLinks({ links, className = "" }: Props) {
  if (links.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`}>
      {links.map((item) => (
        <a
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          <span>{item.label}</span>
          <ExternalLinkIcon />
        </a>
      ))}
    </div>
  );
}
