import { daysLeft, EXPIRY_BANNER_DAYS } from "@/lib/subscription/pass-math";
import { formatPlanDate } from "@/lib/subscription/plan-copy";
import Link from "next/link";

/**
 * Site-wide notice for the parent when the family's one-time Plus pass ends within 7 days.
 * Server-rendered from the header session (never shown in child mode).
 */
export function PlusExpiryBanner({ endsAt }: { endsAt: string | null }) {
  if (!endsAt) return null;
  const end = new Date(endsAt);
  if (Number.isNaN(end.getTime())) return null;
  const n = daysLeft(end);
  if (n <= 0 || n > EXPIRY_BANNER_DAYS) return null;
  return (
    <div role="status" className="border-b border-[#f5c58a] bg-[#fff4e5] px-4 py-2 text-center text-sm text-[var(--color-ink)]">
      <span className="font-semibold">
        Your Plus ends in {n} {n === 1 ? "day" : "days"} ({formatPlanDate(end)}).
      </span>{" "}
      It won&apos;t renew automatically.{" "}
      <Link href="/subscribe" className="font-bold text-[var(--color-link)] underline">
        Keep Plus
      </Link>
    </div>
  );
}
