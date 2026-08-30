/** Simple modern speaker badges for Mass participation (site-owned SVG). */

import type { ReactNode } from "react";

type IconProps = {
  className?: string;
  size?: number;
  title?: string;
};

type BadgeProps = IconProps & {
  bg: string;
  border: string;
  children: ReactNode;
};

function MassSpeakerBadge({ className, size = 40, title, bg, border, children }: BadgeProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <rect x="1" y="1" width="38" height="38" rx="10" fill={bg} stroke={border} strokeWidth="1" />
      <g transform="translate(8 8)">{children}</g>
    </svg>
  );
}

/** Priest: single figure with clerical collar + stole hint. */
export function MassSpeakerPriestIcon({ className, size = 40, title = "Priest" }: IconProps) {
  return (
    <MassSpeakerBadge
      className={className}
      size={size}
      title={title}
      bg="#F5F3FF"
      border="#DDD6FE"
    >
      <circle cx="12" cy="7.5" r="4" stroke="#5B21B6" strokeWidth="1.75" />
      <path
        d="M5 22c0-4.5 3.1-7.5 7-7.5s7 3 7 7.5"
        stroke="#5B21B6"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M8.5 13.5h7M9 13.5v2.5l3 2.5 3-2.5v-2.5"
        stroke="#7C3AED"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </MassSpeakerBadge>
  );
}

/** Assembly: three figures — taller center, smaller sides (children + congregation). */
export function MassSpeakerChildrenIcon({
  className,
  size = 40,
  title = "Children & assembly",
}: IconProps) {
  return (
    <MassSpeakerBadge
      className={className}
      size={size}
      title={title}
      bg="#FFF7ED"
      border="#FED7AA"
    >
      <circle cx="5.5" cy="10" r="2.75" stroke="#C2410C" strokeWidth="1.5" />
      <path
        d="M2 21c0-2.8 1.6-4.5 3.5-4.5s3.5 1.7 3.5 4.5"
        stroke="#C2410C"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="8" r="3.25" stroke="#D35400" strokeWidth="1.75" />
      <path
        d="M6.5 22c0-4 2.5-6.5 5.5-6.5s5.5 2.5 5.5 6.5"
        stroke="#D35400"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="18.5" cy="10" r="2.75" stroke="#C2410C" strokeWidth="1.5" />
      <path
        d="M15 21c0-2.8 1.6-4.5 3.5-4.5s3.5 1.7 3.5 4.5"
        stroke="#C2410C"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </MassSpeakerBadge>
  );
}

/** Optional: direction / rubric lines (not spoken by priest or assembly). */
export function MassSpeakerRubricIcon({ className, size = 40, title = "Direction" }: IconProps) {
  return (
    <MassSpeakerBadge
      className={className}
      size={size}
      title={title}
      bg="#F9FAFB"
      border="#E5E7EB"
    >
      <path
        d="M6 6h12M6 11h12M6 16h8"
        stroke="#6B7280"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="18" cy="16" r="1.25" fill="#9CA3AF" />
    </MassSpeakerBadge>
  );
}

export function MassSpeakerLegend() {
  return (
    <div className="mass-speaker-legend" aria-label="Who speaks">
      <span className="mass-speaker-legend__item">
        <MassSpeakerPriestIcon size={32} />
        <span>Priest</span>
      </span>
      <span className="mass-speaker-legend__item">
        <MassSpeakerChildrenIcon size={32} />
        <span>Children &amp; assembly</span>
      </span>
    </div>
  );
}
