import { BillingButton } from "@/components/BillingButton";
import { PageShell } from "@/components/PageShell";
import { getReaderKey } from "@/lib/bible/reader";
import { requireFamilySession } from "@/lib/family-auth";
import { canonicalForPath } from "@/lib/site-metadata";
import { isBillingConfigured } from "@/lib/stripe";
import { getFamilyPlan } from "@/lib/subscription/entitlements";
import { PLAN_FEATURES, PLUS_PRICE_LABEL, planRenewalLine } from "@/lib/subscription/plan-copy";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catholic Kids Crafts Plus",
  description: "Memos, catechism activities, and custom sheets for your whole family. CA$9.99/month, cancel anytime.",
  ...canonicalForPath("/subscribe"),
};

const btn =
  "block w-full bg-[var(--color-accent)] px-4 py-3 text-center text-sm font-bold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60";

export default async function SubscribePage() {
  const session = await requireFamilySession();
  const reader = await getReaderKey();
  const isChild = reader?.type === "sub";
  const plan = session ? await getFamilyPlan(session.familyAccountId, session.email) : null;
  const configured = isBillingConfigured();
  const renewal = plan ? planRenewalLine(plan) : null;

  return (
    <PageShell>
      <Link href="/account" className="text-sm font-semibold text-[var(--color-link)]">
        &larr; Family account
      </Link>
      <h1 className="mt-6 text-3xl text-[var(--color-ink)]">
        <span className="text-[var(--color-accent)]">✝</span> Catholic Kids Crafts Plus
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        One plan for your whole family - up to 5 children share it.
      </p>

      <section className="mt-8 border border-[var(--color-border)] bg-white p-5 sm:p-6">
        <p className="text-3xl font-bold text-[var(--color-ink)]">
          {PLUS_PRICE_LABEL}
          <span className="text-sm font-normal text-[var(--color-muted)]">/month</span>
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {PLAN_FEATURES.map((f) => (
            <li key={f.label} className="flex items-center justify-between gap-2">
              <span className="text-[var(--color-ink)]">{f.label}</span>
              <span className="text-xs font-semibold text-green-800">{f.plus ? "Plus" : "Free + Plus"}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          {isChild ? (
            <p className="text-sm font-semibold text-[var(--color-ink)]">Ask a parent to set up Plus.</p>
          ) : !session ? (
            <>
              <Link href="/account/login" className={btn}>
                Sign in with Google to subscribe
              </Link>
              <p className="mt-2 text-xs text-[var(--color-muted)]">Parents sign in with their Google account.</p>
            </>
          ) : plan?.isPlus ? (
            <>
              <p className="text-sm font-bold text-green-800">Your family has Plus.</p>
              {renewal && <p className="mt-1 text-xs text-[var(--color-muted)]">{renewal}</p>}
              {plan.hasCustomer && configured && (
                <div className="mt-3">
                  <BillingButton action="portal" className={btn}>
                    Manage subscription
                  </BillingButton>
                </div>
              )}
            </>
          ) : !configured ? (
            <p className="text-sm font-semibold text-[var(--color-muted)]">Subscriptions open soon.</p>
          ) : (
            <BillingButton action="checkout" className={btn}>
              Upgrade to Plus
            </BillingButton>
          )}
        </div>

        <p className="mt-5 text-sm font-bold text-[var(--color-ink)]">Cancel anytime. Your memos stay with you.</p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
          After canceling, you keep Plus until the end of your billing period. Your memos stay readable; new
          memos need Plus. Prices in Canadian dollars{process.env.STRIPE_AUTOMATIC_TAX === "1" ? "; tax calculated at checkout" : ""}.
        </p>
        <p className="mt-3 text-xs text-[var(--color-muted)]">Secure checkout with Stripe.</p>
      </section>
    </PageShell>
  );
}
