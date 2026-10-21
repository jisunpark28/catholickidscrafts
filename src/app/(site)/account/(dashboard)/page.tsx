import { BillingButton } from "@/components/BillingButton";
import { FamilyLogoutButton } from "@/components/FamilyLogoutButton";
import { SubProfilesManager } from "@/components/SubProfilesManager";
import { PageShell } from "@/components/PageShell";
import { MAX_SUB_PROFILES_PER_FAMILY } from "@/lib/access-code";
import { loadAccountDashboardReaders } from "@/lib/account-dashboard";
import { requireFamilySession } from "@/lib/family-auth";
import { canonicalForPath } from "@/lib/site-metadata";
import { isBillingConfigured } from "@/lib/stripe";
import { getFamilyPlan } from "@/lib/subscription/entitlements";
import { PLAN_FEATURES, PLUS_PRICE_LABEL, planRenewalLine } from "@/lib/subscription/plan-copy";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Family account",
  description: "Manage your family's reading profiles, plan, and sign-in.",
  ...canonicalForPath("/account"),
};

export default async function AccountDashboardPage() {
  const session = await requireFamilySession();
  const { owner, subs } = await loadAccountDashboardReaders(session!.familyAccountId);
  const plan = await getFamilyPlan(session!.familyAccountId, session!.email);
  const isPlus = plan.isPlus;
  const renewal = planRenewalLine(plan);
  const billingReady = isBillingConfigured();

  return (
    <PageShell wide>
      <Link href="/" className="text-sm font-semibold text-[var(--color-link)]">
        &larr; Home
      </Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl text-[var(--color-ink)]">Family account</h1>
          <p className="mt-2 break-all text-sm text-[var(--color-muted)]">
            {owner.displayName} &middot; {session!.email}
          </p>
        </div>
        <FamilyLogoutButton mode="signout" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <SubProfilesManager
          initialOwner={owner}
          initialSubs={subs}
          maxSubs={MAX_SUB_PROFILES_PER_FAMILY}
        />

        <div className="flex flex-col gap-6">
          <section className="border border-[var(--color-border)] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-[var(--color-ink)]">Plan</h2>
              <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-bold text-[var(--color-ink)]">
                {isPlus ? "Plus" : "Free"}
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {PLAN_FEATURES.map((f) => (
                <li key={f.label} className="flex items-center justify-between gap-2">
                  <span className="text-[var(--color-ink)]">{f.label}</span>
                  <span
                    className={`text-xs font-semibold ${
                      !f.plus || isPlus ? "text-green-800" : "text-[var(--color-muted)]"
                    }`}
                  >
                    {!f.plus ? "Included" : isPlus ? "Included" : "Plus"}
                  </span>
                </li>
              ))}
            </ul>
            {!isPlus && (
              <>
                <p className="mt-5 text-2xl font-bold text-[var(--color-ink)]">
                  {PLUS_PRICE_LABEL}<span className="text-sm font-normal text-[var(--color-muted)]">/month</span>
                </p>
                {billingReady ? (
                  <div className="mt-3">
                    <BillingButton action="checkout" className="block w-full bg-[var(--color-accent)] px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60">
                      Upgrade to Plus
                    </BillingButton>
                  </div>
                ) : (
                  <Link href="/subscribe" className="mt-3 block bg-[var(--color-accent)] px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-[var(--color-accent-hover)]">
                    Upgrade to Plus
                  </Link>
                )}
              </>
            )}
            {renewal && <p className="mt-4 text-sm text-[var(--color-ink)]">{renewal}</p>}
            <p className="mt-4 text-sm font-bold text-[var(--color-ink)]">
              Cancel anytime. Your memos stay with you.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
              After canceling, you keep Plus until the end of your billing period. Your memos stay
              readable; new memos need Plus.
            </p>
            <p className="mt-3 text-xs text-[var(--color-muted)]">Secure checkout with Stripe.</p>
          </section>

          <section className="border border-[var(--color-border)] bg-white p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[var(--color-ink)]">Account &amp; security</h2>
            <div className="mt-4 flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-4 text-sm">
              <span className="text-[var(--color-ink)]">Billing &amp; receipts</span>
              {plan.hasCustomer && billingReady ? (
                <BillingButton action="portal" className="text-xs font-bold text-[var(--color-link)] hover:underline">
                  Manage
                </BillingButton>
              ) : (
                <span className="text-xs font-semibold text-[var(--color-muted)]">No payments yet</span>
              )}
            </div>
            <div className="mt-4">
              <FamilyLogoutButton mode="all" />
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
