"use client";

import { useState } from "react";

type CheckoutButtonProps = {
  businessName?: string;
};

export function CheckoutButton({ businessName }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Checkout is unavailable");
      }

      window.location.href = data.url;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout failed. Try again.",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="mt-8 w-full rounded-full bg-brand py-4 text-lg font-bold text-white transition hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Redirecting to checkout…" : "Pay $199 — Publish now"}
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <p className="mt-4 text-xs text-muted">
        Secure payment via Stripe. Test card: 4242 4242 4242 4242
      </p>
    </div>
  );
}
