"use client";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { clearCart } = useCartStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
      redirect: "if_required",
    });

    if (error) {
      toast.error("Payment failed", error.message);
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      toast.success("Payment successful!");
      clearCart();
      router.push("/checkout/success");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement />
      <button disabled={loading || !stripe} className="btn-primary w-full py-4 mt-4">
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export default function PaymentPage() {
  const { items, getSummary } = useCartStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const summary = getSummary();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Please login", "You need to be logged in to complete your purchase.");
      router.push(`/login?callbackUrl=/checkout/payment`);
      return;
    }

    if (items.length === 0) {
      router.push("/checkout/cart");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || `Server error: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.success) setClientSecret(data.data.clientSecret);
          else {
            toast.error("Checkout error", data.error);
            if (data.error === "Unauthorized") {
              router.push("/login?callbackUrl=/checkout/payment");
            }
          }
        })
        .catch((err) => {
          console.error("Payment setup error:", err);
          toast.error("Payment setup failed", err.message || "Could not initialize checkout.");
        });
    }
  }, [items, router, status]);

  if (!clientSecret) {
    return (
      <div className="container py-24 text-center">
        <div className="skeleton w-full max-w-md h-96 mx-auto rounded-2xl mb-8" />
        <p className="text-secondary animate-pulse">Initializing secure checkout...</p>
        {status === "unauthenticated" && <p className="text-red-400 mt-4">You are not logged in.</p>}
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Complete Payment</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="card p-6 h-fit">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <div key={item.ticketTypeId} className="flex justify-between text-sm">
                <span className="text-secondary">{item.quantity}x {item.ticketTypeName}</span>
                <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-3 mt-3 flex justify-between font-bold text-xl">
              <span>Total</span>
              <span className="gradient-text">{formatCurrency(summary.total)}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          {!stripePromise ? (
            <div className="text-center py-8">
              <p className="text-red-400 font-bold mb-2">Configuration Error</p>
              <p className="text-xs text-secondary">Stripe key is missing in environment variables.</p>
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night" } }}>
              <CheckoutForm clientSecret={clientSecret} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
