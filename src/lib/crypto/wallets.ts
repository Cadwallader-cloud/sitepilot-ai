import type { CryptoAsset, CryptoNetwork } from "@/lib/crypto/assets";
import { getSupabaseAdmin } from "@/lib/supabase";

export type PaymentWalletRow = {
  id: string;
  currency: CryptoAsset;
  network: CryptoNetwork;
  address: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

function isNonEmptyAddress(address: string): boolean {
  return address.trim().length >= 10;
}

export async function listPaymentWallets(): Promise<PaymentWalletRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("payment_wallets")
    .select("*")
    .order("currency", { ascending: true });

  if (error || !data) {
    console.error("listPaymentWallets:", error?.message);
    return [];
  }
  return data as PaymentWalletRow[];
}

/** Active wallet with a real address for checkout. */
export async function getActivePaymentWallet(
  currency: CryptoAsset,
  network: CryptoNetwork,
): Promise<PaymentWalletRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("payment_wallets")
    .select("*")
    .eq("currency", currency)
    .eq("network", network)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as PaymentWalletRow;
  if (!isNonEmptyAddress(row.address)) return null;
  return row;
}

export async function upsertPaymentWallet(params: {
  currency: CryptoAsset;
  network: CryptoNetwork;
  address: string;
  active: boolean;
}): Promise<PaymentWalletRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const address = params.address.trim();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("payment_wallets")
    .upsert(
      {
        currency: params.currency,
        network: params.network,
        address,
        active: params.active && isNonEmptyAddress(address),
        updated_at: now,
      },
      { onConflict: "currency,network" },
    )
    .select("*")
    .single();

  if (error || !data) {
    console.error("upsertPaymentWallet:", error?.message);
    return null;
  }
  return data as PaymentWalletRow;
}

export async function updatePaymentWallet(params: {
  id: string;
  address?: string;
  active?: boolean;
}): Promise<PaymentWalletRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (typeof params.address === "string") {
    patch.address = params.address.trim();
  }
  if (typeof params.active === "boolean") {
    patch.active = params.active;
  }

  const { data, error } = await supabase
    .from("payment_wallets")
    .update(patch)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error || !data) {
    console.error("updatePaymentWallet:", error?.message);
    return null;
  }

  const row = data as PaymentWalletRow;
  // Never leave active=true with an empty address
  if (row.active && !isNonEmptyAddress(row.address)) {
    const { data: fixed } = await supabase
      .from("payment_wallets")
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq("id", row.id)
      .select("*")
      .single();
    return (fixed as PaymentWalletRow) ?? { ...row, active: false };
  }

  return row;
}
