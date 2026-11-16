import { BillingButton, PlanCheckout } from "@/components/BillingButton";
import { PageShell } from "@/components/PageShell";
import { SubscribeBenefits } from "@/components/subscribe/SubscribeBenefits";
import { getReaderKey } from "@/lib/bible/reader";
import { requireFamilySession, requireParentActive } from "@/lib/family-auth";
import { pageMetadata } from "@/lib/site-metadata";
import { isBillingConfigured } from "@/lib/stripe";
import { getFamilyPlan } from "@/lib/subscription/entitlements";
import {
  BEST_VALUE_BADGE,
  ONE_TIME_LINE,
  PLAN_FEATURES,
  PLAN_OPTIONS,
  planRenewalLine,
} from "@/lib/subscription/plan-copy";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Catholic Kids Crafts Plus – Family Plan",
  absoluteTitle: true,
  description:
    "One Plus plan for the whole family, up to 5 children: Bible typing extras, memos and catechism activities. US$5.99 for 1 month or US$29.99 for 1 year. One-time payment, no auto-renew.",
  path: "/subscribe",
});

const btn =
  "block w-full bg-[var(--color-accent)] px-6 py-4 text-center text-base font-bold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60 sm:py-5 sm:text-lg";

export default async function SubscribePage() {
  const familySession = await requireFamilySession();
  const session = await requireParentActive();
  const reader = await getReaderKey();
  const isChild = reader?.type === "sub" || Boolean(familySession && !session);
  const plan = session ? await getFamilyPlan(session.familyAccountId) : null;
  const configured = isBillingConfigured();
  const renewal = plan ? planRenewalLine(plan) : null;
  // Price ids stay on the server; the client only sends "month" or "year".
  const onLegacySubscription = plan?.source === "stripe";
  const onPreview = plan?.source === "preview";
  const canBuy = !isChild && Boolean(session) && configured && !onLegacySubscription && !onPreview;

  return (
    <PageShell wide>
      <Link href="/account" className="text-sm font-semibold text-[var(--color-link)]">
        &larr; Family account
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        <span className="text-[var(--color-accent)]">✝</span> Catholic Kids Crafts Plus
      </h1>
      <p className="mt-2 max-w-2xl text-base text-[var(--color-muted)]">
        One plan for your whole family - up to 5 children share it.
      </p>

      <section className="mt-8 border border-[var(--color-border)] bg-white p-6 sm:p-8 lg:p-10">
        {!canBuy && (
          <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(["month", "year"] as const).map((k) => {
              const o = PLAN_OPTIONS[k];
              return (
                <div
                  key={k}
                  className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-6 text-center sm:px-6 sm:py-7"
                >
                  {k === "year" ? (
                    <span className="mb-3 inline-block rounded-full bg-[var(--color-accent)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                      {BEST_VALUE_BADGE}
                    </span>
                  ) : null}
                  <span className="block text-base font-bold text-[var(--color-ink)] sm:text-lg">{o.name}</span>
                  <p className="mt-3 text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
                    {o.price}
                    <span className="text-base font-normal text-[var(--color-muted)] sm:text-lg">{o.unit}</span>
                  </p>
                  <p className="mt-1.5 text-sm text-[var(--color-muted)] sm:text-base">{o.billed}</p>
                </div>
              );
            })}
          </div>
        )}
        <p className={`${canBuy ? "mt-2" : "mt-4"} text-center text-base font-bold text-[var(--color-ink)]`}>
          {ONE_TIME_LINE}
        </p>
        <ul className="mt-5 grid gap-3 text-base sm:grid-cols-3">
          {PLAN_FEATURES.map((f) => (
            <li
              key={f.label}
              className="flex items-center justify-between gap-2 border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
            >
              <span className="text-[var(--color-ink)]">{f.label}</span>
              <span className="text-sm font-semibold text-green-800">{f.plus ? "Plus" : "Free + Plus"}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          {isChild ? (
            <p className="text-base font-semibold text-[var(--color-ink)]">Ask a parent to set up Plus.</p>
          ) : !session ? (
            <>
              <Link href="/account/login" className={btn}>
                Sign in with Google to get Plus
              </Link>
              <p className="mt-2 text-sm text-[var(--color-muted)]">Parents sign in with their Google account.</p>
            </>
          ) : onLegacySubscription || onPreview ? (
            <>
              <p className="text-base font-bold text-green-800">Your family has Plus.</p>
              {renewal && <p className="mt-1 text-sm text-[var(--color-muted)]">{renewal}</p>}
              {onLegacySubscription && plan?.hasCustomer && configured && (
                <div className="mt-3">
                  <BillingButton action="portal" className={btn}>
                    Manage subscription
                  </BillingButton>
                </div>
              )}
            </>
          ) : !configured ? (
            <p className="text-base font-semibold text-[var(--color-muted)]">Plus opens soon.</p>
          ) : (
            <>
              {plan?.isPlus && (
                <div className="mb-4">
                  <p className="text-base font-bold text-green-800">Your family has Plus.</p>
                  {renewal && <p className="mt-1 text-sm text-[var(--color-muted)]">{renewal}</p>}
                </div>
              )}
              <PlanCheckout className={btn} extend={Boolean(plan?.isPlus)} />
            </>
          )}
        </div>

        <p className="mt-6 text-base font-bold text-[var(--color-ink)]">Nothing to cancel. Your memos stay with you.</p>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--color-muted)]">
          Plus simply stops at the end of your pass - we never charge you again. We email you 7 days and 1 day
          before it ends. Buying again adds time after your current pass. When Plus ends, your memos stay
          readable; new memos need Plus. Prices in US dollars{process.env.STRIPE_AUTOMATIC_TAX === "1" ? "; tax calculated at checkout" : ""}.
        </p>
        <p className="mt-3 text-sm text-[var(--color-muted)]">Secure checkout with Stripe.</p>
      </section>

      <SubscribeBenefits />
    </PageShell>
  );
}
