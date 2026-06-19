import { FamilyLogoutButton } from "@/components/FamilyLogoutButton";
import { ReaderStatusBar } from "@/components/ReaderStatusBar";
import { SubProfilesManager } from "@/components/SubProfilesManager";
import { PageShell } from "@/components/PageShell";
import { MAX_SUB_PROFILES_PER_FAMILY } from "@/lib/access-code";
import { requireFamilySession } from "@/lib/family-auth";
import { getReaderDisplay } from "@/lib/reader-display";
import { prisma } from "@/lib/prisma";
import { canonicalForPath } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Family dashboard",
  description: "Manage reader Access IDs and Bible sticker progress.",
  ...canonicalForPath("/account"),
};

export default async function AccountDashboardPage() {
  const session = await requireFamilySession();
  const reader = await getReaderDisplay();

  const subs = await prisma.subProfile.findMany({
    where: { familyAccountId: session!.familyAccountId },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      displayName: true,
      accessCodeLast4: true,
      active: true,
      _count: { select: { progress: true } },
    },
  });

  const ownerStickers = await prisma.bibleChapterProgress.count({
    where: { familyAccountId: session!.familyAccountId },
  });

  return (
    <PageShell>
      <Link href="/" className="text-sm font-semibold text-[var(--color-link)]">
        ← Home
      </Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl text-[var(--color-ink)]">Family dashboard</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{session!.email}</p>
        </div>
        <FamilyLogoutButton />
      </div>

      <ReaderStatusBar reader={reader} />

      <p className="mt-6 text-sm text-[var(--color-muted)]">
        Your Bible stickers (parent reader): <strong>{ownerStickers}</strong> chapters completed.
      </p>

      <SubProfilesManager
        initialSubs={subs.map((s) => ({
          id: s.id,
          displayName: s.displayName,
          accessCodeLast4: s.accessCodeLast4,
          active: s.active,
          stickerCount: s._count.progress,
        }))}
        maxSubs={MAX_SUB_PROFILES_PER_FAMILY}
      />
    </PageShell>
  );
}
