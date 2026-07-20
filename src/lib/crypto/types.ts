import type { CryptoAsset, CryptoNetwork } from "@/lib/crypto/assets";
import type { PlanId } from "@/lib/billing/types";

export type CryptoOrderStatus =
  | "pending"
  | "awaiting_payment"
  | "paid"
  | "expired"
  | "canceled"
  | "failed";

export type CryptoOrderRow = {
  id: string;
  order_ref: string;
  user_email: string;
  plan_id: PlanId;
  asset: CryptoAsset;
  network: CryptoNetwork;
  amount: number | string;
  currency: string;
  wallet_address: string;
  status: CryptoOrderStatus;
  provider: string | null;
  provider_payment_id: string | null;
  provider_tx_hash: string | null;
  provider_payload: Record<string, unknown>;
  expires_at: string;
  paid_at: string | null;
  paid_by: string | null;
  project_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CryptoOrderPublic = {
  id: string;
  orderRef: string;
  planId: PlanId;
  asset: CryptoAsset;
  network: CryptoNetwork;
  methodId: string;
  amount: number;
  currency: string;
  walletAddress: string;
  status: CryptoOrderStatus;
  expiresAt: string;
  paidAt: string | null;
  /** User clicked "I Paid" — still awaits admin Mark Paid. */
  declaredPaid: boolean;
  qrPayload: string;
  createdAt: string;
};

/** Source of fulfillment — keeps webhook automation plug-compatible. */
export type FulfillmentSource = "manual" | "webhook" | "system";
