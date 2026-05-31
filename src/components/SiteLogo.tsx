import Image from "next/image";
import Link from "next/link";
import logo from "@/Logo.png";

type Props = {
  size?: "header" | "hero";
  showWordmark?: boolean;
  className?: string;
};

const heights = { header: 72, hero: 140 } as const;

export function SiteLogo({
  size = "header",
  showWordmark = true,
  className = "",
}: Props) {
  const height = heights[size];

  return (
    <Link
      href="/mass"
      className={`inline-flex items-center gap-3 bg-transparent ${className}`}
      aria-label="Catholic Kids Crafts home"
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
