import Image from "next/image";
import Link from "next/link";
import logo from "@/Logo.png";

type Props = {
  size?: "header" | "hero";
  showWordmark?: boolean;
  className?: string;
  /** Use same-origin home link (hub header) instead of canonical production URL */
  linkToHome?: boolean;
};

const heights = { header: 80, hero: 140 } as const;

/** Canonical site home (header logo links here). */
const SITE_HOME_URL = "https://www.catholickidscrafts.com/";

export function SiteLogo({
  size = "header",
  showWordmark = true,
  className = "",
  linkToHome = false,
}: Props) {
  const height = heights[size];
  const href = linkToHome ? "/" : SITE_HOME_URL;

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-3 bg-transparent ${className}`}
      aria-label="Catholic Kids Crafts — go to home page"
    >
      <Image
        src={logo}
        alt="Catholic Kids Crafts logo"
        className="block w-auto max-w-none object-contain drop-shadow-sm"
        style={{ height: `${height}px`, width: "auto" }}
        priority
      />
      {showWordmark && (
        <span className="hidden text-lg font-bold tracking-tight text-[var(--color-ink)] sm:inline lg:text-xl">
          Catholic Kids Crafts
        </span>
      )}
    </Link>
  );
}
