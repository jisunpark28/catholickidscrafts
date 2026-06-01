import {
  AMAZON_ASSOCIATE_DISCLOSURE,
  AMAZON_ASSOCIATE_DISCLOSURE_SHORT,
} from "@/lib/external-links";
import Link from "next/link";

type Props = {
  variant?: "inline" | "block" | "short";
  className?: string;
};

export function AffiliateDisclosure({ variant = "inline", className = "" }: Props) {
  const text =
    variant === "short"
      ? AMAZON_ASSOCIATE_DISCLOSURE_SHORT
      : AMAZON_ASSOCIATE_DISCLOSURE;

  if (variant === "block") {
    return (
      <aside
        className={`border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-muted)] ${className}`}
        role="note"
      >
        <p>{text}</p>
        <p className="mt-2">
          <Link href="/affiliate-disclosure" className="font-semibold text-[var(--color-link)]">
            Affiliate disclosure
          </Link>
        </p>
      </aside>
    );
  }

  return (
    <p className={`text-sm text-[var(--color-muted)] ${className}`} role="note">
      {text}{" "}
      <Link href="/affiliate-disclosure" className="font-semibold text-[var(--color-link)]">
        Learn more
      </Link>
    </p>
  );
}
