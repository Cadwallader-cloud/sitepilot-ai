import { requireAdmin } from "@/lib/admin";
import { listCryptoOrders, toPublicOrder } from "@/lib/crypto";
import { NextResponse } from "next/server";

/** GET — list crypto orders for admin review. */
export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;

  const rows = await listCryptoOrders({
    status: status as
      | "pending"
      | "awaiting_payment"
      | "paid"
      | "expired"
      | "canceled"
      | "failed"
      | undefined,
    limit: 100,
  });

  return NextResponse.json({
    ok: true,
    orders: rows.map((row) => ({
      ...toPublicOrder(row),
      userEmail: row.user_email,
      provider: row.provider,
      providerTxHash: row.provider_tx_hash,
      paidBy: row.paid_by,
    })),
  });
}
