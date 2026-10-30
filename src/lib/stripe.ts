import Stripe from "stripe";
import { getSiteUrl } from "@/lib/site-url";
import type { PassPlan } from "@/lib/subscription/pass-math";

let client: Stripe | null = null;

/** Stripe server client, or null when STRIPE_SECRET_KEY is not set. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  if (!client) client = new Stripe(key, { appInfo: { name: "catholickidscrafts" } });
  return client;
}

/** Stripe Price ids for the one-time Plus passes (US$5.99 / 1 month, US$29.99 / 1 year). Server-only. */
export function stripePriceForPlan(plan: PassPlan): string | null {
  const raw = plan === "year" ? process.env.STRIPE_PRICE_YEAR : process.env.STRIPE_PRICE_MONTH;
  const id = raw?.trim();
  return id && /^price_[A-Za-z0-9]+$/.test(id) ? id : null;
}

/** Which plan a Stripe Price id belongs to (null for anything that isn't one of our two prices). */
export function planForStripePrice(priceId: string | null | undefined): PassPlan | null {
  if (!priceId) return null;
  if (priceId === stripePriceForPlan("month")) return "month";
  if (priceId === stripePriceForPlan("year")) return "year";
  return null;
}

export function isBillingConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() && stripePriceForPlan("month") && stripePriceForPlan("year"),
  );
}

export function automaticTaxEnabled(): boolean {
  return process.env.STRIPE_AUTOMATIC_TAX?.trim() === "1";
}

/** Absolute origin for Stripe redirect URLs (localhost in dev when AUTH_URL points there). */
export function billingOrigin(): string {
  if (process.env.NODE_ENV !== "production") {
    const dev = process.env.AUTH_URL?.trim();
    if (dev) return dev.replace(/\/$/, "");
  }
  return getSiteUrl();
}

export function billingNotConfiguredResponse() {
  return Response.json({ error: "Billing not configured" }, { status: 503 });
}
