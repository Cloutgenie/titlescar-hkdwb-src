import { timingSafeEqual } from "crypto";
import Stripe from "stripe";
import { DEFAULT_WHOP_CHECKOUT_URL } from "./copy";

export type CheckoutMode = "stripe" | "whop" | "unconfigured";

export function getWhopCheckoutUrl(): string {
  return process.env.WHOP_CHECKOUT_URL?.trim() || DEFAULT_WHOP_CHECKOUT_URL;
}

export function getCheckoutMode(): CheckoutMode {
  if (process.env.STRIPE_SECRET_KEY) return "stripe";
  if (getWhopCheckoutUrl()) return "whop";
  return "unconfigured";
}

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function createStripeCheckout(input: {
  origin: string;
}): Promise<{ url: string } | { error: string }> {
  const stripe = stripeClient();
  if (!stripe) return { error: "Stripe is not configured." };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    submit_type: "pay",
    allow_promotion_codes: false,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: 3900,
          product_data: {
            name: "TitleScar diminished-value pack",
            description:
              "One-time ZIP: DV demand letter, 17c floor worksheet, comps sheet, evidence, lowball/DOI/small-claims. Not legal advice.",
          },
        },
      },
    ],
    success_url: `${input.origin}/pack?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/start`,
  });

  if (!session.url) return { error: "Stripe did not return a checkout URL." };
  return { url: session.url };
}

export async function stripeSessionIsPaid(sessionId: string): Promise<boolean> {
  const stripe = stripeClient();
  if (!stripe || !sessionId.startsWith("cs_")) return false;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session.payment_status === "paid";
  } catch {
    return false;
  }
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function expectedUnlockKey() {
  const fromEnv = process.env.HOLD_UNLOCK_KEY?.trim();
  if (fromEnv) return fromEnv;
  // Server-only fallback so a Vercel deploy can unlock after Whop
  // redirect when the dashboard env is not set yet. Not imported by
  // any client module. Prefer HOLD_UNLOCK_KEY in production.
  return "ts_live_b1417f958cf7aa16292c2cc7c55cc2733c0714185f38684f";
}

export function unlockKeyIsValid(key: string | null | undefined): boolean {
  const expected = expectedUnlockKey();
  if (!expected || !key) return false;
  return safeEqual(expected, key);
}

export async function paymentIsVerified(input: {
  sessionId?: string | null;
  unlockKey?: string | null;
}): Promise<boolean> {
  if (input.sessionId && (await stripeSessionIsPaid(input.sessionId))) {
    return true;
  }
  return unlockKeyIsValid(input.unlockKey);
}
