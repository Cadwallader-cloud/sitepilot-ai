import {
  CRYPTO_METHODS,
  getCryptoAmountUsd,
  getCryptoMethod,
  getOrderTtlMinutes,
  type CryptoCheckoutPlanId,
  type CryptoPaymentMethod,
} from "@/lib/crypto/assets";
import type {
  CryptoOrderPublic,
  CryptoOrderRow,
  CryptoOrderStatus,
} from "@/lib/crypto/types";
import { getActivePaymentWallet } from "@/lib/crypto/wallets";
import { getSupabaseAdmin } from "@/lib/supabase";
import { randomBytes } from "node:crypto";

function generateOrderRef(): string {
  const part = randomBytes(4).toString("hex").toUpperCase();
  return `CST-${part}`;
}

export function methodIdForOrder(order: CryptoOrderRow): string {
  const found = CRYPTO_METHODS.find(
    (m) => m.asset === order.asset && m.network === order.network,
  );
  return found?.id ?? `${order.asset}_${order.network}`.toLowerCase();
}

/** QR / copy payload — address for Phase 1 (wallets scan deposit address). */
export function qrPayloadForOrder(order: CryptoOrderRow): string {
  return order.wallet_address;
}

export function toPublicOrder(order: CryptoOrderRow): CryptoOrderPublic {
  const amount =
    typeof order.amount === "string" ? Number(order.amount) : order.amount;
  const declaredPaid = Boolean(
    order.metadata &&
      typeof order.metadata === "object" &&
      order.metadata.userDeclaredPaidAt,
  );
  return {
    id: order.id,
    orderRef: order.order_ref,
    planId: order.plan_id,
    asset: order.asset,
    network: order.network,
    methodId: methodIdForOrder(order),
    amount,
    currency: order.currency,
    walletAddress: order.wallet_address,
    status: effectiveStatus(order),
    expiresAt: order.expires_at,
    paidAt: order.paid_at,
    declaredPaid,
    qrPayload: qrPayloadForOrder(order),
    createdAt: order.created_at,
  };
}

/** Expire pending orders that passed expires_at (lazy). */
export function effectiveStatus(order: CryptoOrderRow): CryptoOrderStatus {
  if (
    (order.status === "pending" || order.status === "awaiting_payment") &&
    new Date(order.expires_at).getTime() <= Date.now()
  ) {
    return "expired";
  }
  return order.status;
}

export async function createCryptoOrder(params: {
  userEmail: string;
  methodId: string;
  planId?: CryptoCheckoutPlanId;
  projectId?: string | null;
}): Promise<CryptoOrderRow> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("SUPABASE_NOT_CONFIGURED");

  const method = getCryptoMethod(params.methodId);
  if (!method) throw new Error("INVALID_METHOD");

  const wallet = await getActivePaymentWallet(method.asset, method.network);
  if (!wallet) throw new Error("WALLET_NOT_CONFIGURED");

  const planId: CryptoCheckoutPlanId = params.planId ?? "pro";
  const amount = getCryptoAmountUsd(planId);
  const ttl = getOrderTtlMinutes();
  const expiresAt = new Date(Date.now() + ttl * 60_000).toISOString();
  const email = params.userEmail.trim().toLowerCase();

  let lastError: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const orderRef = generateOrderRef();
    const { data, error } = await supabase
      .from("crypto_orders")
      .insert({
        order_ref: orderRef,
        user_email: email,
        plan_id: planId,
        asset: method.asset,
        network: method.network,
        amount,
        currency: "USD",
        wallet_address: wallet.address,
        status: "awaiting_payment",
        provider: "manual",
        expires_at: expiresAt,
        project_id: params.projectId ?? null,
        metadata: {
          methodId: method.id,
          paymentWalletId: wallet.id,
        },
      })
      .select("*")
      .single();

    if (!error && data) return data as CryptoOrderRow;
    lastError = error?.message ?? "insert failed";
    if (error?.code !== "23505") break; // unique violation → retry ref
  }

  console.error("createCryptoOrder:", lastError);
  throw new Error("ORDER_CREATE_FAILED");
}

export async function getCryptoOrderById(
  id: string,
): Promise<CryptoOrderRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("crypto_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  const order = data as CryptoOrderRow;

  // Lazy expire in DB
  if (
    effectiveStatus(order) === "expired" &&
    order.status !== "expired"
  ) {
    await supabase
      .from("crypto_orders")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("id", id)
      .in("status", ["pending", "awaiting_payment"]);
    return { ...order, status: "expired" };
  }

  return order;
}

export async function listCryptoOrders(params?: {
  status?: CryptoOrderStatus;
  limit?: number;
}): Promise<CryptoOrderRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from("crypto_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(params?.limit ?? 100);

  if (params?.status) {
    query = query.eq("status", params.status);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("listCryptoOrders:", error?.message);
    return [];
  }
  return data as CryptoOrderRow[];
}

export async function listConfiguredMethods(): Promise<
  (CryptoPaymentMethod & { configured: boolean })[]
> {
  const results = await Promise.all(
    CRYPTO_METHODS.map(async (m) => {
      const wallet = await getActivePaymentWallet(m.asset, m.network);
      return { ...m, configured: Boolean(wallet) };
    }),
  );
  return results;
}

/** User clicked "I Paid" — does not activate plan; admin still confirms. */
export async function declareCryptoOrderPaid(
  orderId: string,
  userEmail: string,
): Promise<CryptoOrderRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const order = await getCryptoOrderById(orderId);
  if (!order) return null;
  if (order.user_email !== userEmail.trim().toLowerCase()) return null;
  if (order.status !== "awaiting_payment" && order.status !== "pending") {
    return order;
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("crypto_orders")
    .update({
      metadata: {
        ...(order.metadata ?? {}),
        userDeclaredPaidAt: now,
      },
      updated_at: now,
    })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("declareCryptoOrderPaid:", error?.message);
    return null;
  }
  return data as CryptoOrderRow;
}

export async function cancelCryptoOrder(
  orderId: string,
  userEmail: string,
): Promise<CryptoOrderRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const order = await getCryptoOrderById(orderId);
  if (!order) return null;
  if (order.user_email !== userEmail.trim().toLowerCase()) return null;
  if (order.status === "paid") return order;

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("crypto_orders")
    .update({ status: "canceled", updated_at: now })
    .eq("id", orderId)
    .in("status", ["pending", "awaiting_payment"])
    .select("*")
    .single();

  if (error || !data) {
    console.error("cancelCryptoOrder:", error?.message);
    return null;
  }
  return data as CryptoOrderRow;
}
