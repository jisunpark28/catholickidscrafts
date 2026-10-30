import { PageShell } from "@/components/PageShell";
import { requireParentActive } from "@/lib/family-auth";
import { getStripe } from "@/lib/stripe";
import { getFamilyPlan } from "@/lib/subscription/entitlements";
import { formatPlanDate } from "@/lib/subscription/plan-copy";
import { grantPassFromCheckoutSession } from "@/lib/subscription/plus-pass";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Welcome to Plus",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ session_id?: string }> };

/** Grant right away so Plus shows even if the webhook is still on its way (idempotent with it). */
async function syncFromCheckout(sessionId: string, familyAccountId: string) {
  const stripe = getStripe();
  if (!stripe || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return;
  try {
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    // Only the family that started this checkout can trigger the grant from this page.
    if (checkout.client_reference_id !== familyAccountId || checkout.mode !== "payment") return;
    await grantPassFromCheckoutSession(stripe, checkout.id);
  } catch (err) {
    console.error("[billing] success-page sync failed", err);
  }
}

export default async function SubscribeSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const session = await requireParentActive();
  if (session && session_id) await syncFromCheckout(session_id, session.familyAccountId);
  const plan = session ? await getFamilyPlan(session.familyAccountId) : null;

  return (
    <PageShell>
      <h1 className="text-3xl text-[var(--color-ink)]">
        <span className="text-[var(--color-accent)]">✝</span> Thank you!
      </h1>
      {plan?.isPlus ? (
        <p className="mt-3 text-sm text-[var(--color-ink)]">
          Your family now has Plus. Every child profile on your account can use memos and catechism activities.
          {plan.passEndsAt && <> Plus is active until {formatPlanDate(plan.passEndsAt)}.</>}
        </p>
      ) : (
        <p className="mt-3 text-sm text-[var(--color-ink)]">
          We&apos;re confirming your payment. This usually takes a few seconds - refresh this page or check your
          family account shortly.
        </p>
      )}
      <p className="mt-2 text-xs text-[var(--color-muted)]">One-time payment. No auto-renew. A receipt is on its way to your email from Stripe.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/account"
          className="bg-[var(--color-accent)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)]"
        >
          Go to family account
        </Link>
        <Link href="/bible" className="border border-[var(--color-border)] px-4 py-2.5 text-sm font-bold">
          Start reading
        </Link>
      </div>
    </PageShell>
  );
}
