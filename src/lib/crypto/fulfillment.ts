/**
 * Single fulfillment path for crypto orders.
 * Phase 1: Admin marks Paid → this runs.
 * Future: webhook handlers call the same function with source: "webhook".
 */
import { BillingService } from "@/lib/billing/service";
import { isPlanId } from "@/lib/billing/catalog";
import { getCryptoOrderById } from "@/lib/crypto/orders";
import type { CryptoOrderRow, FulfillmentSource } from "@/lib/crypto/types";
import { getSupabaseAdmin } from "@/lib/supabase";

export type FulfillResult = {
  ok: boolean;
  order: CryptoOrderRow | null;
  alreadyPaid?: boolean;
  error?: string;
};

export async function fulfillCryptoOrder(params: {
  orderId: string;
  source: FulfillmentSource;
  actorEmail?: string | null;
  txHash?: string | null;
  provider?: string | null;
  providerPaymentId?: string | null;
  providerPayload?: Record<string, unknown>;
}): Promise<FulfillResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, order: null, error: "SUPABASE_NOT_CONFIGURED" };
  }

  const order = await getCryptoOrderById(params.orderId);
  if (!order) {
    return { ok: false, order: null, error: "ORDER_NOT_FOUND" };
  }

  if (order.status === "paid") {
    return { ok: true, order, alreadyPaid: true };
  }

  if (order.status === "canceled" || order.status === "failed") {
    return { ok: false, order, error: "ORDER_NOT_PAYABLE" };
  }

  if (
    (order.status === "pending" || order.status === "awaiting_payment") &&
    new Date(order.expires_at).getTime() <= Date.now()
  ) {
    await supabase
      .from("crypto_orders")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("id", order.id);
    return {
      ok: false,
      order: { ...order, status: "expired" },
      error: "ORDER_EXPIRED",
    };
  }

  const planId = isPlanId(order.plan_id)
    ? order.plan_id === "free"
      ? "pro"
      : order.plan_id
    : "pro";
  const now = new Date().toISOString();

  const billing = await BillingService.changePlan({
    userEmail: order.user_email,
    planId,
    provider: params.provider ?? `crypto:${params.source}`,
    actorEmail: params.actorEmail ?? null,
    metadata: {
      cryptoOrderId: order.id,
      cryptoOrderRef: order.order_ref,
      fulfillmentSource: params.source,
      asset: order.asset,
      network: order.network,
      txHash: params.txHash ?? null,
    },
  });

  if (!billing) {
    return { ok: false, order, error: "SUBSCRIPTION_UPDATE_FAILED" };
  }

  const { data, error } = await supabase
    .from("crypto_orders")
    .update({
      status: "paid",
      paid_at: now,
      paid_by: params.actorEmail ?? params.source,
      provider: params.provider ?? order.provider ?? "manual",
      provider_tx_hash: params.txHash ?? order.provider_tx_hash,
      provider_payment_id:
        params.providerPaymentId ?? order.provider_payment_id,
      provider_payload: {
        ...(order.provider_payload ?? {}),
        ...(params.providerPayload ?? {}),
        fulfilledAt: now,
        source: params.source,
      },
      updated_at: now,
    })
    .eq("id", order.id)
    .select("*")
    .single();

  if (error || !data) {
    console.error("fulfillCryptoOrder update:", error?.message);
    return { ok: false, order, error: "ORDER_UPDATE_FAILED" };
  }

  return { ok: true, order: data as CryptoOrderRow };
}

/**
 * Future webhook entrypoint — providers normalize here then fulfill.
 * Phase 1: unused; keep signature stable.
 */
export async function handleCryptoPaymentWebhook(_params: {
  provider: string;
  externalId: string;
  rawBody: unknown;
  signature?: string | null;
}): Promise<FulfillResult> {
  return {
    ok: false,
    order: null,
    error: "WEBHOOK_NOT_CONFIGURED",
  };
}
