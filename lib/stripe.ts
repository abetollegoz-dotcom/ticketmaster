import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

export const STRIPE_CURRENCY = "usd";

export const PLATFORM_FEE_PERCENT = 5; // 5% platform fee

/** Create a payment intent for checkout */
export async function createPaymentIntent(
  amount: number, // in cents
  currency: string = STRIPE_CURRENCY,
  metadata: Record<string, string> = {}
) {
  return stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}

/** Retrieve payment intent */
export async function getPaymentIntent(intentId: string) {
  return stripe.paymentIntents.retrieve(intentId);
}

/** Create a Stripe Connect account for organizers */
export async function createConnectAccount(email: string) {
  return stripe.accounts.create({
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
  return stripe.accountLinks.create({
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
  return stripe.transfers.create({
    amount,
    currency: STRIPE_CURRENCY,
    destination: destinationAccountId,
    metadata,
  });
}

/** Process a refund */
export async function createRefund(chargeId: string, amount?: number) {
  return stripe.refunds.create({
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
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

/** Convert dollars to cents */
export const toCents = (amount: number) => Math.round(amount * 100);

/** Convert cents to dollars */
export const fromCents = (cents: number) => cents / 100;
