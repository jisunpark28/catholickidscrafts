import { AccountDashboardTabs } from "@/components/account/AccountDashboardTabs";
import { BillingButton, PlanCheckout } from "@/components/BillingButton";
import { FamilyLogoutButton } from "@/components/FamilyLogoutButton";
import { SubProfilesManager } from "@/components/SubProfilesManager";
import { MomsBibleAccountSection } from "@/components/moms-bible/MomsBibleAccountSection";
import { ParentReplyBanner } from "@/components/moms-bible/MbBanners";
import { PageShell } from "@/components/PageShell";
import { MAX_SUB_PROFILES_PER_FAMILY } from "@/lib/access-code";
import { loadAccountDashboardReaders } from "@/lib/account-dashboard";
import { requireParentActive } from "@/lib/family-auth";
import { accountMomsBible } from "@/lib/moms-bible/account-data";
import { redirect } from "next/navigation";
import { canonicalForPath } from "@/lib/site-metadata";
import { prisma } from "@/lib/prisma";
import { isBillingConfigured } from "@/lib/stripe";
import { getFamilyPlan } from "@/lib/subscription/entitlements";
import { formatPlanDate, ONE_TIME_LINE, PLAN_FEATURES, planRenewalLine } from "@/lib/subscription/plan-copy";
import { daysLeft, EXPIRY_BANNER_DAYS } from "@/lib/subscription/pass-math";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Family account",
  description: "Manage your family's reading profiles, plan, and sign-in.",
  ...canonicalForPath("/account"),
};

export default async function AccountDashboardPage() {
  const session = await requireParentActive();
  if (!session) redirect("/");
  const { owner, subs } = await loadAccountDashboardReaders(session!.familyAccountId);
  const plan = await getFamilyPlan(session!.familyAccountId);
  const isPlus = plan.isPlus;
  const renewal = planRenewalLine(plan);
  const btnPrimary =
    "block w-full bg-[var(--color-accent)] px-4 py-3 text-center text-base font-bold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60";
  const billingReady = isBillingConfigured();
  const passEndsAt = plan.source === "pass" ? plan.passEndsAt : null;
  const passDaysLeft = passEndsAt ? daysLeft(passEndsAt) : null;
  const canBuy = billingReady && (plan.source === "pass" || plan.source === "free");
  const memoCount = await prisma.biblePassageMemo.count({
    where: { familyAccountId: session!.familyAccountId },
  });
  const momsBible = await accountMomsBible(session!.familyAccountId);

  const accountPanel = (
    <SubProfilesManager
      initialOwner={owner}
      initialSubs={subs}
      maxSubs={MAX_SUB_PROFILES_PER_FAMILY}
    />
  );

  const plusPanel = (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <section className="border border-[var(--color-border)] bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-[var(--color-ink)]">Plus plan</h2>
          <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-bold text-[var(--color-ink)]">
            {isPlus ? "Plus" : "Free"}
          </span>
        </div>
        <p className="mt-3 text-base text-[var(--color-ink)]">
          One-time pass for the whole family. No auto-renew.
        </p>
        <ul className="mt-5 space-y-2.5 text-base">
          {PLAN_FEATURES.map((f) => (
            <li key={f.label} className="flex items-center justify-between gap-2">
              <span className="text-[var(--color-ink)]">{f.label}</span>
              <span
                className={`text-sm font-semibold ${
                  !f.plus || isPlus ? "text-green-800" : "text-[var(--color-muted)]"
                }`}
              >
                {!f.plus ? "Included" : isPlus ? "Included" : "Plus"}
              </span>
            </li>
          ))}
        </ul>
        {passEndsAt && passDaysLeft !== null && (
          <div
            className={`mt-6 rounded-xl border px-4 py-3 ${
              passDaysLeft <= EXPIRY_BANNER_DAYS
                ? "border-[#f5c58a] bg-[#fff4e5]"
                : "border-[var(--color-border)] bg-[var(--color-surface)]"
            }`}
          >
            <p className="text-base font-bold text-[var(--color-ink)]">
              Plus until {formatPlanDate(passEndsAt)}
            </p>
            <p className="mt-0.5 text-base text-[var(--color-ink)]">
              {passDaysLeft} {passDaysLeft === 1 ? "day" : "days"} left
            </p>
          </div>
        )}
        {!passEndsAt && renewal && (
          <p className="mt-5 text-base text-[var(--color-ink)]">{renewal}</p>
        )}
        {canBuy ? (
          <div className="mt-6">
            <PlanCheckout className={btnPrimary} extend={isPlus} />
          </div>
        ) : !isPlus ? (
          <Link href="/subscribe" className={`mt-6 ${btnPrimary}`}>
            Get Plus
          </Link>
        ) : null}
        <p className="mt-5 text-base font-bold text-[var(--color-ink)]">{ONE_TIME_LINE}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
          Plus stops at the end of your pass - nothing to cancel. We email you 7 days and 1 day before
          it ends. Your memos stay readable; new memos need Plus.
        </p>
        <p className="mt-3 text-sm text-[var(--color-muted)]">Secure checkout with Stripe.</p>
      </section>

      <section className="border border-[var(--color-border)] bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-[var(--color-ink)]">Account and security</h2>
        <div className="mt-5 flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4 text-base">
          <span className="font-semibold text-[var(--color-ink)]">Billing and receipts</span>
          {plan.hasCustomer && billingReady ? (
            <BillingButton
              action="portal"
              className="text-sm font-bold text-[var(--color-link)] hover:underline"
            >
              Manage
            </BillingButton>
          ) : (
            <span className="text-sm font-semibold text-[var(--color-muted)]">No payments yet</span>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4 text-base">
          <span className="font-semibold text-[var(--color-ink)]">Signed in as</span>
          <span className="max-w-[60%] break-all text-right text-sm text-[var(--color-muted)]">
            {session!.email}
          </span>
        </div>
        <div className="mt-5">
          <FamilyLogoutButton mode="all" />
        </div>
      </section>
    </div>
  );

  const notesPanel = (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <section className="border border-[var(--color-border)] bg-white p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-bold text-[var(--color-ink)]">My memos</h2>
          <Link
            href="/account/memos"
            className="shrink-0 text-sm font-bold text-[var(--color-link)] hover:underline"
          >
            View all
          </Link>
        </div>
        <p className="mt-3 text-base text-[var(--color-muted)]">
          {memoCount} private {memoCount === 1 ? "memo" : "memos"} on Bible passages
        </p>
        {memoCount === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border)] px-4 py-5">
            <p className="text-sm text-[var(--color-muted)]">
              Memos you leave while typing appear here.
            </p>
          </div>
        ) : (
          <p className="mt-5 text-sm text-[var(--color-muted)]">
            Open View all to read, edit, or print your private memos.
          </p>
        )}
      </section>

      <MomsBibleAccountSection
        roleLabel={momsBible.roleLabel}
        emailMode={momsBible.emailMode}
        ownChildren={momsBible.ownChildren}
        joined={momsBible.joined}
        memoImport={momsBible.memoImport}
      />
    </div>
  );

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-[960px]">
        <Link href="/" className="text-sm font-semibold text-[var(--color-link)]">
          &larr; Home
        </Link>
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-4xl font-bold tracking-tight text-[var(--color-ink)] sm:text-5xl">
              Family account
            </h1>
            <p className="mt-2 text-base text-[var(--color-muted)]">
              {owner.displayName} &middot; parent
            </p>
          </div>
          <FamilyLogoutButton mode="signout" />
        </div>

        {momsBible.replies.count > 0 && (
          <div className="mt-6">
            <ParentReplyBanner data={momsBible.replies} />
          </div>
        )}

        <AccountDashboardTabs account={accountPanel} plus={plusPanel} notes={notesPanel} />
      </div>
    </PageShell>
  );
}
