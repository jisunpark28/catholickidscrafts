import Stripe from "stripe";
import { getSiteUrl } from "@/lib/site-url";

let client: Stripe | null = null;

/** Stripe server client, or null when STRIPE_SECRET_KEY is not set. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  if (!client) client = new Stripe(key, { appInfo: { name: "catholickidscrafts" } });
  return client;
}

export function stripePriceMonthly(): string | null {
  return process.env.STRIPE_PRICE_MONTHLY?.trim() || null;
}

/** Optional; annual plan is not offered yet. */
export function stripePriceAnnual(): string | null {
  return process.env.STRIPE_PRICE_ANNUAL?.trim() || null;
}

export function isBillingConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim() && stripePriceMonthly());
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
