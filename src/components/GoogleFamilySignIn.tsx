import Link from "next/link";

type Props = {
  enabled?: boolean;
};

export function GoogleFamilySignIn({ enabled = false }: Props) {
  if (!enabled) return null;

  return (
    <div className="mt-6">
      <div className="relative flex items-center py-2">
        <div className="grow border-t border-[var(--color-border)]" />
        <span className="mx-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          or
        </span>
        <div className="grow border-t border-[var(--color-border)]" />
      </div>
      <Link
        href="/api/auth/family/google"
        className="mt-4 flex w-full items-center justify-center gap-2 border border-[var(--color-border)] bg-white py-3 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
      >
        <span aria-hidden>G</span>
        Continue with Google
      </Link>
    </div>
  );
}
