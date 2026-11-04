import Link from "next/link";
import "@/styles/moms-bible.css";

/** Right column when there is no Mom's Bible to show: guests, or a parent without a child profile. */
export function MomsBibleSignInCard({ variant }: { variant: "guest" | "no-child" }) {
  return (
    <aside className="bible-reader__notes mb-panel" aria-labelledby="mb-intro-title">
      <div className="mb-card">
        <h2 id="mb-intro-title" className="mb-panel__title">
          <span aria-hidden>💌</span> Mom&apos;s Bible
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
          Parents highlight verses, write a letter for a chapter and leave little notes and prayers. Children
          answer with stickers and a few words of their own.
        </p>
        {variant === "guest" ? (
          <Link href="/account/login" className="mb-btn mb-btn--primary mt-3 inline-block">
            Parent sign in
          </Link>
        ) : (
          <Link href="/account" className="mb-btn mb-btn--primary mt-3 inline-block">
            Add your child to start
          </Link>
        )}
        <p className="mt-3 text-xs">
          <Link href="/moms-bible/situations" className="mb-link">
            Verses for life&apos;s moments →
          </Link>
        </p>
      </div>
    </aside>
  );
}
