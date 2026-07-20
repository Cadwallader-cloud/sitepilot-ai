import { handleCryptoPaymentWebhook } from "@/lib/crypto";
import { NextResponse } from "next/server";

/**
 * Future automation entrypoint.
 * Phase 1: returns 501 — providers will POST here and call fulfillCryptoOrder.
 */
export async function POST(request: Request) {
  const provider = request.headers.get("x-crypto-provider") ?? "unknown";
  let rawBody: unknown = null;
  try {
    rawBody = await request.json();
  } catch {
    rawBody = null;
  }

  const result = await handleCryptoPaymentWebhook({
    provider,
    externalId: "",
    rawBody,
    signature: request.headers.get("x-signature"),
  });

  return NextResponse.json(
    {
      ok: false,
      error: result.error ?? "WEBHOOK_NOT_CONFIGURED",
      hint: "Phase 1 uses Admin → Mark Paid. Wire provider adapters here later.",
    },
    { status: 501 },
  );
}
