import type Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { billingNotConfiguredResponse, getStripe } from "@/lib/stripe";
import {
  invoiceSubscriptionId,
  linkCheckoutCustomer,
  syncSubscriptionById,
} from "@/lib/subscription/billing-sync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Version-independent handling: the webhook endpoint may use a newer API version
 * (or snapshot payloads) than our SDK. From the event we read only event.id, event.type
 * and data.object.id, then re-retrieve the object through the SDK so its shape always
 * matches the SDK's pinned API version.
 */
function eventObjectId(event: { data?: { object?: unknown } }): string | null {
  const obj = event.data?.object as { id?: unknown } | undefined;
  return typeof obj?.id === "string" ? obj.id : null;
}

function idOf(v: string | { id: string } | null | undefined): string | null {
  if (!v) return null;
  return typeof v === "string" ? v : v.id;
}

async function handle(stripe: Stripe, type: string, objectId: string): Promise<void> {
  switch (type) {
    case "checkout.session.completed": {
      const session = await stripe.checkout.sessions.retrieve(objectId);
      if (session.mode !== "subscription") return;
      await linkCheckoutCustomer(session);
      const subId = idOf(session.subscription);
      if (subId) await syncSubscriptionById(stripe, subId);
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      // Re-fetch so out-of-order deliveries always store the latest state.
      await syncSubscriptionById(stripe, objectId);
      return;
    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = await stripe.invoices.retrieve(objectId);
      const subId = invoiceSubscriptionId(invoice);
      if (subId) await syncSubscriptionById(stripe, subId);
      return;
    }
    default:
      return;
  }
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) return billingNotConfiguredResponse();

  const signature = req.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing signature" }, { status: 400 });

  // Signature is verified on the exact raw body.
  const raw = await req.text();
  let event: { id: string; type: string; data?: { object?: unknown } };
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret) as unknown as typeof event;
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (typeof event.id !== "string" || typeof event.type !== "string") {
    return Response.json({ error: "Malformed event" }, { status: 400 });
  }

  const existing = await prisma.billingEvent.findUnique({
    where: { stripeEventId: event.id },
    select: { processedAt: true },
  });
  if (existing?.processedAt) return Response.json({ received: true, duplicate: true });
  if (!existing) {
    try {
      await prisma.billingEvent.create({
        data: {
          stripeEventId: event.id,
          type: event.type,
          payload: JSON.parse(raw) as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) throw err;
    }
  }

  try {
    const objectId = eventObjectId(event);
    if (objectId) await handle(stripe, event.type, objectId);
    await prisma.billingEvent.update({
      where: { stripeEventId: event.id },
      data: { processedAt: new Date(), error: null },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[billing] webhook failed", event.type, event.id, message);
    await prisma.billingEvent
      .update({ where: { stripeEventId: event.id }, data: { error: message.slice(0, 1000) } })
      .catch(() => undefined);
    // 500 so Stripe retries.
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }
  return Response.json({ received: true });
}
