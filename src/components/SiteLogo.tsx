import Image from "next/image";
import Link from "next/link";
import logo from "@/Logo.png";

type Props = {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
};

const heights = { sm: 36, md: 44, lg: 80 } as const;

export function SiteLogo({
  size = "md",
  showWordmark = true,
  className = "",
}: Props) {
  const height = heights[size];

  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 ${className}`}
      aria-label="Catholic Kids Crafts home"
    >
      <Image
        src={logo}
        alt="Catholic Kids Crafts logo"
        className="w-auto object-contain"
        style={{ height: `${height}px`, width: "auto" }}
        priority={size !== "sm"}
      />
      {showWordmark && (
        <span
          className={`font-extrabold text-slate-800 ${
            size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-base"
          }`}
        >
          Catholic Kids Crafts
        </span>
      )}
    </Link>
  );
}
