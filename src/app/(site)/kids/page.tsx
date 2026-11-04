import { KidProfilePicker } from "@/components/kid/KidProfilePicker";
import { PageShell } from "@/components/PageShell";
import { ReaderStatusBar } from "@/components/ReaderStatusBar";
import { requireParentActive } from "@/lib/family-auth";
import { KID_LOGIN_LABELS as L } from "@/lib/kids/kid-login-copy";
import { getReaderDisplay } from "@/lib/reader-display";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kids sign-in",
  // Sign-in screens have no search value; keep them out of the index.
  robots: { index: false, follow: true },
  description: "Children sign in with their Kid Code and a 4-digit PIN from a parent.",
  ...canonicalForPath("/kids"),
};

/** Netflix-style device picker: tap a profile, type the PIN (Mom's Bible PR-2). */
export default async function KidsSignInPage() {
  const [reader, parent] = await Promise.all([getReaderDisplay(), requireParentActive()]);

  return (
    <PageShell>
      <Link href="/" className="text-sm font-semibold text-[var(--color-link)]">
        ← Home
      </Link>
      <h1 className="mt-6 text-center text-3xl text-[var(--color-ink)]">{L.title}</h1>
      <p className="mx-auto mt-3 max-w-lg text-center text-[var(--color-muted)]">{L.subtitle}</p>

      <div className="mx-auto max-w-lg">
        <ReaderStatusBar reader={reader} />
      </div>

      <div className="mt-10 flex justify-center">
        <KidProfilePicker canEditProfiles={Boolean(parent)} />
      </div>
    </PageShell>
  );
}
