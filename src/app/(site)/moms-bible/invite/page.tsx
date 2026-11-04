import { InviteAcceptClient } from "@/components/moms-bible/InviteAcceptClient";
import { PageShell } from "@/components/PageShell";
import { requireParentActive } from "@/lib/family-auth";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join your child's Bible",
  robots: { index: false, follow: false },
};

/** Co-parent invite landing. The token stays in the URL fragment (never sent to the server in logs). */
export default async function MomsBibleInvitePage() {
  const parent = await requireParentActive();
  return (
    <PageShell>
      <div className="mx-auto max-w-lg">
        <h1 className="text-center text-3xl text-[var(--color-ink)]">💌 Join your child&apos;s Bible</h1>
        <p className="mt-3 text-center text-[var(--color-muted)]">
          You were invited to read your child&apos;s Bible and leave notes, highlights and prayers for them.
        </p>
        <InviteAcceptClient signedIn={Boolean(parent)} />
      </div>
    </PageShell>
  );
}
