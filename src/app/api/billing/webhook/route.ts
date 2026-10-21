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

async function handle(stripe: Stripe, event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await linkCheckoutCustomer(session);
      const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      if (subId) await syncSubscriptionById(stripe, subId);
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      // Re-fetch so out-of-order deliveries always store the latest state.
      await syncSubscriptionById(stripe, event.data.object.id);
      return;
    case "invoice.paid":
    case "invoice.payment_failed": {
      const subId = invoiceSubscriptionId(event.data.object);
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

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const existing = await prisma.billingEvent.findUnique({
    where: { stripeEventId: event.id },
    select: { processedAt: true },
  });
  if (existing?.processedAt) return Response.json({ received: true, duplicate: true });
  if (!existing) {
    try {
      await prisma.billingEvent.create({
        data: { stripeEventId: event.id, type: event.type, payload: event as unknown as Prisma.InputJsonValue },
      });
    } catch (err) {
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) throw err;
    }
  }

  try {
    await handle(stripe, event);
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
