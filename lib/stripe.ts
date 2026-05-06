import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Lazy-load Stripe instance to prevent crashes during module evaluation
 * if the environment variables are missing.
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is missing. Please add it to your .env.local file.");
    }
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: "2026-04-22.dahlia" as any,
      typescript: true,
    });
  }
  return stripeInstance;
}

/**
 * Proxy for Stripe instance that initializes on first use.
 * This maintains compatibility with existing code that imports { stripe }.
 */
export const stripe = new Proxy({} as Stripe, {
  get(target, prop, receiver) {
    const instance = getStripe();
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export const STRIPE_CURRENCY = "usd";

export const PLATFORM_FEE_PERCENT = 5; // 5% platform fee

/** Create a payment intent for checkout */
export async function createPaymentIntent(
  amount: number, // in cents
  currency: string = STRIPE_CURRENCY,
  metadata: Record<string, string> = {}
) {
  return getStripe().paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}

/** Retrieve payment intent */
export async function getPaymentIntent(intentId: string) {
  return getStripe().paymentIntents.retrieve(intentId);
}

/** Create a Stripe Connect account for organizers */
export async function createConnectAccount(email: string) {
  return getStripe().accounts.create({
    type: "express",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
}

/** Generate onboarding link for organizer */
export async function createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
  return getStripe().accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: "account_onboarding",
  });
}

/** Transfer funds to organizer */
export async function transferToOrganizer(
  amount: number,
  destinationAccountId: string,
  metadata: Record<string, string> = {}
) {
  return getStripe().transfers.create({
    amount,
    currency: STRIPE_CURRENCY,
    destination: destinationAccountId,
    metadata,
  });
}

/** Process a refund */
export async function createRefund(chargeId: string, amount?: number) {
  return getStripe().refunds.create({
    charge: chargeId,
    ...(amount ? { amount } : {}),
  });
}

/** Verify Stripe webhook signature */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return getStripe().webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

/** Convert dollars to cents */
export const toCents = (amount: number) => Math.round(amount * 100);

/** Convert cents to dollars */
export const fromCents = (cents: number) => cents / 100;
