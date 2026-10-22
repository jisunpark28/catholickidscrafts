/**
 * Decorative homepage background: small crosses, leafy branches, stars/sparkles and a heart in the corners.
 * Inline SVG (no extra requests), behind the content, non-interactive and hidden from assistive tech.
 * Phones keep only a few smaller pieces so they never crowd the content.
 */
export function Cross({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 32" className={className}>
      <rect x="9" y="1" width="6" height="30" rx="1.5" fill="#9b6a3f" />
      <rect x="2" y="8" width="20" height="6" rx="1.5" fill="#9b6a3f" />
      <rect x="10.2" y="2" width="1.4" height="28" fill="#b98656" opacity="0.6" />
    </svg>
  );
}

export function Star({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 2l2.9 6.2 6.8.8-5 4.6 1.4 6.7L12 17l-6.1 3.3 1.4-6.7-5-4.6 6.8-.8z" fill="#f2c14e" stroke="#e0a92e" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}

export function Sparkle({ className, color = "#e9c46a" }: { className: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 1c.8 5.6 4.4 9.2 11 11-6.6 1.8-10.2 5.4-11 11-.8-5.6-4.4-9.2-11-11 6.6-1.8 10.2-5.4 11-11z" fill={color} />
    </svg>
  );
}

export function Branch({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 40 48" className={className}>
      <path d="M20 47C20 34 19 20 22 3" stroke="#6f8f55" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {[
        [21, 8, -35],
        [21, 15, 35],
        [20.5, 22, -35],
        [20.5, 29, 35],
        [20, 36, -35],
      ].map(([x, y, r], i) => (
        <ellipse key={i} cx={x + (r < 0 ? -6 : 6)} cy={y} rx="7" ry="3.2" transform={`rotate(${r} ${x} ${y})`} fill={i % 2 ? "#8fb07a" : "#7a9e64"} />
      ))}
    </svg>
  );
}

export function Heart({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 22" className={className}>
      <path d="M12 21C5 16 1 12 1 7.2 1 3.8 3.6 1 6.8 1c2.1 0 3.9 1.1 5.2 3 1.3-1.9 3.1-3 5.2-3C20.4 1 23 3.8 23 7.2 23 12 19 16 12 21z" fill="#e8907e" />
    </svg>
  );
}

export function HomeBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden opacity-80 print:hidden">
      {/* Top-right */}
      <Sparkle className="absolute right-[13%] top-1 h-3 w-3" color="#e8cfa0" />
      <Cross className="absolute right-[5%] top-3 h-8 w-6 rotate-12" />
      <Star className="absolute right-[9%] top-11 hidden h-3.5 w-3.5 sm:block" />
      <Branch className="absolute -right-1 top-16 hidden h-12 w-10 -rotate-12 lg:block" />
      {/* Bottom-right */}
      <Branch className="absolute bottom-10 right-[13%] h-10 w-9 rotate-[8deg] sm:h-12 sm:w-10" />
      <Cross className="absolute bottom-16 right-[24%] hidden h-7 w-5 -rotate-6 sm:block" />
      <Star className="absolute bottom-6 right-[30%] h-4 w-4" />
      <Heart className="absolute bottom-6 right-[4%] h-4 w-4 sm:h-5 sm:w-5" />
      <Sparkle className="absolute bottom-24 right-[3%] hidden h-3 w-3 sm:block" color="#f0d58c" />
      {/* Bottom-left */}
      <Cross className="absolute bottom-8 left-[3%] hidden h-7 w-5 rotate-[-10deg] lg:block" />
      <Sparkle className="absolute bottom-20 left-[8%] hidden h-3 w-3 lg:block" color="#e8cfa0" />
    </div>
  );
}
