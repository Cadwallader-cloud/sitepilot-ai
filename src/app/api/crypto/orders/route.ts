import { auth } from "@/auth";
import {
  createCryptoOrder,
  getCryptoAmountUsd,
  getOrderTtlMinutes,
  isCryptoCheckoutPlanId,
  isCryptoMethodId,
  listConfiguredMethods,
  toPublicOrder,
} from "@/lib/crypto";
import { NextResponse } from "next/server";

/** GET — available payment methods + amounts (addresses come from payment_wallets). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const planParam = url.searchParams.get("plan");
  const planId = isCryptoCheckoutPlanId(planParam) ? planParam : "pro";

  const configured = await listConfiguredMethods();
  const methods = configured.map((m) => ({
    id: m.id,
    asset: m.asset,
    network: m.network,
    label: m.label,
    blurb: m.blurb,
    configured: m.configured,
  }));

  return NextResponse.json({
    ok: true,
    planId,
    amountUsd: getCryptoAmountUsd(planId),
    amountsUsd: {
      pro: getCryptoAmountUsd("pro"),
      business: getCryptoAmountUsd("business"),
    },
    ttlMinutes: getOrderTtlMinutes(),
    methods,
  });
}

/** POST — create a unique crypto order for the signed-in user. */
export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: { methodId?: unknown; projectId?: unknown; planId?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const methodId =
    typeof body.methodId === "string" ? body.methodId.trim() : "";
  if (!isCryptoMethodId(methodId)) {
    return NextResponse.json({ error: "Invalid methodId" }, { status: 400 });
  }

  const projectId =
    typeof body.projectId === "string" && body.projectId.trim()
      ? body.projectId.trim()
      : null;
  const planId = isCryptoCheckoutPlanId(body.planId) ? body.planId : "pro";

  try {
    const order = await createCryptoOrder({
      userEmail: email,
      methodId,
      planId,
      projectId,
    });
    return NextResponse.json({ ok: true, order: toPublicOrder(order) });
  } catch (err) {
    const code = err instanceof Error ? err.message : "ORDER_CREATE_FAILED";
    if (code === "WALLET_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error:
            "Crypto wallets are not configured. Add an active address in Admin → Payment wallets.",
          code,
        },
        { status: 503 },
      );
    }
    if (code === "SUPABASE_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "Database not configured", code },
        { status: 503 },
      );
    }
    console.error("POST /api/crypto/orders:", err);
    return NextResponse.json(
      { error: "Could not create order", code },
      { status: 500 },
    );
  }
}
