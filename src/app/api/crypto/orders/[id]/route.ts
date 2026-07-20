import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import {
  cancelCryptoOrder,
  declareCryptoOrderPaid,
  getCryptoOrderById,
  toPublicOrder,
} from "@/lib/crypto";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/** GET — order status for owner (or admin). Poll for expiration / paid. */
export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  const email = session?.user?.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await context.params;
  const order = await getCryptoOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = order.user_email === email.toLowerCase();
  if (!isOwner && !isAdminEmail(email)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, order: toPublicOrder(order) });
}

/**
 * PATCH — owner actions (manual flow, no chain automation):
 * { action: "i_paid" } — user declares payment sent
 * { action: "cancel" } — cancel awaiting order
 */
export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  const email = session?.user?.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: { action?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id } = await context.params;

  if (body.action === "i_paid") {
    const order = await declareCryptoOrderPaid(id, email);
    if (!order) {
      return NextResponse.json({ error: "Could not update order" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, order: toPublicOrder(order) });
  }

  if (body.action === "cancel") {
    const order = await cancelCryptoOrder(id, email);
    if (!order) {
      return NextResponse.json({ error: "Could not cancel order" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, order: toPublicOrder(order) });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
