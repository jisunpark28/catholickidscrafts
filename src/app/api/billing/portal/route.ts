import { billingNotConfiguredResponse, billingOrigin, getStripe } from "@/lib/stripe";
import { getFamilySubscription } from "@/lib/subscription/entitlements";
import { requireBillingParent } from "@/lib/subscription/require-parent";

export const dynamic = "force-dynamic";

export async function POST() {
  const stripe = getStripe();
  if (!stripe) return billingNotConfiguredResponse();

  const parent = await requireBillingParent();
  if ("error" in parent) return parent.error;

  const { customer } = await getFamilySubscription(parent.session.familyAccountId);
  if (!customer) return Response.json({ error: "No billing history yet" }, { status: 404 });

  const portal = await stripe.billingPortal.sessions.create({
    customer: customer.stripeCustomerId,
    return_url: `${billingOrigin()}/account`,
  });
  return Response.json({ url: portal.url });
}
