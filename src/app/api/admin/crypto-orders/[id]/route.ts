import { requireAdmin } from "@/lib/admin";
import { fulfillCryptoOrder, getCryptoOrderById, toPublicOrder } from "@/lib/crypto";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PATCH — mark order Paid (Phase 1 manual approval).
 * Body: { action: "mark_paid", txHash?: string }
 * Upgrades subscription via fulfillCryptoOrder (same path webhooks will use).
 */
export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  let body: { action?: unknown; txHash?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action !== "mark_paid") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  const existing = await getCryptoOrderById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await fulfillCryptoOrder({
    orderId: id,
    source: "manual",
    actorEmail: admin,
    txHash: typeof body.txHash === "string" ? body.txHash.trim() : null,
    provider: "manual",
  });

  if (!result.ok || !result.order) {
    return NextResponse.json(
      { error: result.error ?? "Fulfillment failed" },
      { status: result.error === "ORDER_EXPIRED" ? 410 : 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    alreadyPaid: Boolean(result.alreadyPaid),
    order: toPublicOrder(result.order),
  });
}
