import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "default";
  className?: string;
};

/** Rounded nav pill with hand-drawn sketch border (mockup style). */
export function HomeNavPill({ href, children, variant = "default", className = "" }: Props) {
  const base =
    "relative block w-full rounded-[2rem] px-8 py-5 text-center text-xl transition sm:text-2xl";
  const styles =
    variant === "primary"
      ? "bg-[#f5d4b8] text-[var(--color-ink)] shadow-md hover:bg-[#f0c9a8]"
      : "bg-white text-[var(--color-ink)] hover:bg-[var(--color-surface)]";

  return (
    <Link href={href} className={`group ${base} ${styles} ${className}`}>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-[#2d3748]"
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
        aria-hidden
      >
        <rect
          x="4"
          y="4"
          width="392"
          height="72"
          rx="36"
          ry="36"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="opacity-90"
        />
      </svg>
      <span className="relative z-10">{children}</span>
    </Link>
  );
}
