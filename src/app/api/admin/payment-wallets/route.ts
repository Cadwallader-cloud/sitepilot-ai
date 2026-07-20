import { requireAdmin } from "@/lib/admin";
import {
  isCryptoAsset,
  isCryptoNetwork,
  listPaymentWallets,
  updatePaymentWallet,
  upsertPaymentWallet,
} from "@/lib/crypto";
import { NextResponse } from "next/server";

/** GET — list deposit wallets (admin). */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const wallets = await listPaymentWallets();
  return NextResponse.json({ ok: true, wallets });
}

/**
 * PATCH — update wallet address / active flag.
 * Body: { id, address?, active? } OR { currency, network, address, active? }
 */
export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    id?: unknown;
    currency?: unknown;
    network?: unknown;
    address?: unknown;
    active?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const address =
    typeof body.address === "string" ? body.address.trim() : undefined;
  const active = typeof body.active === "boolean" ? body.active : undefined;

  if (typeof body.id === "string" && body.id.trim()) {
    if (address === undefined && active === undefined) {
      return NextResponse.json(
        { error: "address or active required" },
        { status: 400 },
      );
    }
    const wallet = await updatePaymentWallet({
      id: body.id.trim(),
      address,
      active,
    });
    if (!wallet) {
      return NextResponse.json(
        {
          error:
            "Could not update wallet. Run supabase/schema-payment-wallets.sql first.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: true, wallet });
  }

  if (!isCryptoAsset(body.currency) || !isCryptoNetwork(body.network)) {
    return NextResponse.json(
      { error: "currency and network required" },
      { status: 400 },
    );
  }
  if (address === undefined) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  const wallet = await upsertPaymentWallet({
    currency: body.currency,
    network: body.network,
    address,
    active: active ?? true,
  });

  if (!wallet) {
    return NextResponse.json(
      {
        error:
          "Could not save wallet. Run supabase/schema-payment-wallets.sql first.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, wallet });
}
