import { requireAdmin } from "@/lib/admin";
import { BillingService, isPlanId, listPlans, listSubscriptions } from "@/lib/billing";
import type { PlanId, SubscriptionStatus } from "@/lib/billing/types";
import { NextResponse } from "next/server";

/** GET — list subscriptions + plans (admin). */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [subscriptions, plans] = await Promise.all([
    listSubscriptions(),
    listPlans(),
  ]);

  return NextResponse.json({ ok: true, subscriptions, plans });
}

/**
 * PATCH — change plan and/or activate/cancel subscription.
 * Body: { userEmail, planId?, status? }
 */
export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { userEmail?: unknown; planId?: unknown; status?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userEmail =
    typeof body.userEmail === "string" ? body.userEmail.trim() : "";
  if (!userEmail || !userEmail.includes("@")) {
    return NextResponse.json({ error: "userEmail required" }, { status: 400 });
  }

  const status =
    body.status === "canceled" ||
    body.status === "active" ||
    body.status === "inactive"
      ? (body.status as SubscriptionStatus)
      : undefined;

  let planId: PlanId | undefined;
  if (typeof body.planId === "string" && body.planId.trim()) {
    const raw = body.planId.trim();
    if (!isPlanId(raw)) {
      return NextResponse.json({ error: "Invalid planId" }, { status: 400 });
    }
    planId = raw;
  }

  if (!planId && !status) {
    return NextResponse.json(
      { error: "planId or status required" },
      { status: 400 },
    );
  }

  let billing;
  if (status === "canceled" && !planId) {
    billing = await BillingService.cancelSubscription({
      userEmail,
      actorEmail: admin,
    });
  } else if (status === "active" && !planId) {
    billing = await BillingService.activateSubscription({
      userEmail,
      actorEmail: admin,
    });
  } else {
    const current = await BillingService.getCurrentPlan(userEmail);
    billing = await BillingService.changePlan({
      userEmail,
      planId: planId ?? current.planId,
      status: status ?? "active",
      provider: "manual",
      actorEmail: admin,
    });
  }

  if (!billing) {
    return NextResponse.json(
      {
        error:
          "Could not update subscription. Run supabase/schema-billing-v2.sql.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    email: billing.email,
    planId: billing.planId,
    entitlements: billing.entitlements,
    subscription: billing.subscription,
  });
}
