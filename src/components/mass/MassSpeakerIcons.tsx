/** Cute speaker avatars for Mass participation slides (site-owned art). */

type IconProps = {
  className?: string;
  size?: number;
  title?: string;
};

export function MassSpeakerPriestIcon({ className, size = 40, title = "Priest" }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <circle cx="24" cy="24" r="23" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="1.5" />
      <ellipse cx="24" cy="19" rx="9" ry="10" fill="#FDE68A" />
      <path
        d="M14 38c2-6 6-9 10-9s8 3 10 9"
        fill="#7C3AED"
        stroke="#6D28D9"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d="M18 14c1.5-2 4.5-2 6 0" stroke="#4B5563" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="20.5" cy="18.5" r="1.2" fill="#374151" />
      <circle cx="27.5" cy="18.5" r="1.2" fill="#374151" />
      <path d="M22 22.5c1 1 2.5 1 4 0" stroke="#374151" strokeWidth="1" strokeLinecap="round" />
      <rect x="21" y="27" width="6" height="3" rx="1" fill="#F9FAFB" stroke="#D1D5DB" />
      <path d="M24 27v-2" stroke="#E5E7EB" strokeWidth="1.2" />
    </svg>
  );
}

export function MassSpeakerChildrenIcon({
  className,
  size = 40,
  title = "Children & assembly",
}: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <circle cx="24" cy="24" r="23" fill="#FFEDD5" stroke="#FDBA74" strokeWidth="1.5" />
      <ellipse cx="16" cy="22" rx="5.5" ry="6" fill="#FDE68A" />
      <ellipse cx="32" cy="24" rx="5" ry="5.5" fill="#FCD34D" />
      <ellipse cx="24" cy="20" rx="5" ry="5.5" fill="#FBBF24" />
      <circle cx="14.5" cy="21" r="0.9" fill="#374151" />
      <circle cx="17.5" cy="21" r="0.9" fill="#374151" />
      <path d="M15 23.5c1 .8 2 .8 3 0" stroke="#374151" strokeWidth="0.9" strokeLinecap="round" />
      <circle cx="22" cy="19.5" r="0.9" fill="#374151" />
      <circle cx="26" cy="19.5" r="0.9" fill="#374151" />
      <path d="M23 22c1 .7 2 .7 3 0" stroke="#374151" strokeWidth="0.9" strokeLinecap="round" />
      <circle cx="30.5" cy="23" r="0.85" fill="#374151" />
      <circle cx="33.5" cy="23" r="0.85" fill="#374151" />
      <path d="M31 25.2c.8.6 1.6.6 2.4 0" stroke="#374151" strokeWidth="0.85" strokeLinecap="round" />
      <path
        d="M11 38c1.5-4 4-6 7-6m12 6c-1.5-4-4-6-7-6"
        stroke="#D35400"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19 38c1-3 2.5-4.5 5-4.5s4 1.5 5 4.5"
        stroke="#EA580C"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MassSpeakerLegend() {
  return (
    <div className="mass-speaker-legend" aria-label="Who speaks">
      <span className="mass-speaker-legend__item">
        <MassSpeakerPriestIcon size={28} />
        <span>Priest</span>
      </span>
      <span className="mass-speaker-legend__item">
        <MassSpeakerChildrenIcon size={28} />
        <span>Children &amp; assembly</span>
      </span>
    </div>
  );
}
