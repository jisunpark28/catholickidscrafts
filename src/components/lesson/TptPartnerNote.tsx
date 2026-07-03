import Link from "next/link";

const DEFAULT_TPT =
  process.env.NEXT_PUBLIC_TPT_STORE_URL ??
  "https://www.teacherspayteachers.com/store/catholic-kids-crafts";

type Props = {
  variant?: "hub" | "inline";
  tptUrl?: string | null;
  isFreeSample?: boolean;
};

export function TptPartnerNote({ variant = "inline", tptUrl, isFreeSample = true }: Props) {
  const href = tptUrl?.trim() || DEFAULT_TPT;
  const showSample = isFreeSample && tptUrl;

  if (variant === "hub") {
    return (
      <p className="rounded border border-[#e8e0d6] bg-[#fffaf5] px-4 py-3 text-sm text-[var(--color-muted)]">
        <strong className="text-[var(--color-ink)]">Classroom-ready on this site.</strong> Full worksheet
        packs and seasonal bundles live on{" "}
        <Link href={DEFAULT_TPT} className="font-semibold text-[var(--color-link)]" target="_blank" rel="noopener noreferrer">
          Teachers Pay Teachers
        </Link>
        — we link to them from each kit when you need the complete printables.
      </p>
    );
  }

  if (!showSample) return null;

  return (
    <p className="mt-3 text-sm text-[var(--color-muted)]">
      Free sample on this site.{" "}
      <Link href={href} className="font-semibold text-[var(--color-link)]" target="_blank" rel="noopener noreferrer">
        Full classroom pack on TPT →
      </Link>
    </p>
  );
}
