export type CryptoAsset = "USDT" | "USDC" | "BTC";
export type CryptoNetwork = "TRC20" | "POLYGON" | "BITCOIN";

export type CryptoPaymentMethod = {
  id: string;
  asset: CryptoAsset;
  network: CryptoNetwork;
  label: string;
  blurb: string;
};

/** Supported deposit methods (Phase 1). Addresses come from payment_wallets. */
export const CRYPTO_METHODS: CryptoPaymentMethod[] = [
  {
    id: "usdt_trc20",
    asset: "USDT",
    network: "TRC20",
    label: "USDT (TRC20)",
    blurb: "Tether on Tron - low fees",
  },
  {
    id: "usdc_polygon",
    asset: "USDC",
    network: "POLYGON",
    label: "USDC (Polygon)",
    blurb: "USD Coin on Polygon PoS",
  },
  {
    id: "btc_bitcoin",
    asset: "BTC",
    network: "BITCOIN",
    label: "BTC (Bitcoin)",
    blurb: "Send Bitcoin worth the USD amount - admin confirms",
  },
];

export type CryptoCheckoutPlanId = "pro" | "business";

export function getCryptoMethod(id: string): CryptoPaymentMethod | undefined {
  return CRYPTO_METHODS.find((m) => m.id === id);
}

function parseUsdAmount(raw: string | undefined, fallback: number): number {
  const n = raw ? Number(raw) : fallback;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Pro upgrade price in USD (stablecoin amount / BTC equivalent). */
export function getProCryptoAmountUsd(): number {
  return parseUsdAmount(process.env.CRYPTO_PRO_AMOUNT_USD?.trim(), 29);
}

/** Business upgrade price in USD. */
export function getBusinessCryptoAmountUsd(): number {
  return parseUsdAmount(process.env.CRYPTO_BUSINESS_AMOUNT_USD?.trim(), 199);
}

/** Amount for a checkout plan target. */
export function getCryptoAmountUsd(planId: CryptoCheckoutPlanId): number {
  return planId === "business"
    ? getBusinessCryptoAmountUsd()
    : getProCryptoAmountUsd();
}

export function isCryptoCheckoutPlanId(
  value: unknown,
): value is CryptoCheckoutPlanId {
  return value === "pro" || value === "business";
}

export function getOrderTtlMinutes(): number {
  const raw = process.env.CRYPTO_ORDER_TTL_MINUTES?.trim();
  const n = raw ? Number(raw) : 60;
  return Number.isFinite(n) && n >= 5 ? Math.floor(n) : 60;
}

export function isCryptoMethodId(value: unknown): value is string {
  return typeof value === "string" && CRYPTO_METHODS.some((m) => m.id === value);
}

export function isCryptoAsset(value: unknown): value is CryptoAsset {
  return value === "USDT" || value === "USDC" || value === "BTC";
}

export function isCryptoNetwork(value: unknown): value is CryptoNetwork {
  return value === "TRC20" || value === "POLYGON" || value === "BITCOIN";
}

/** Checkout / admin display — BTC is priced in USD equivalent. */
export function formatCryptoPayAmount(
  amount: number,
  asset: CryptoAsset,
): string {
  if (asset === "BTC") return `≈ $${amount} USD in BTC`;
  return `${amount} ${asset}`;
}
