/**
 * Optional payment-provider adapters.
 * Business logic (entitlements) never imports Stripe directly — only these hooks.
 */
import { isPlanId } from "@/lib/billing/catalog";
import { BillingService } from "@/lib/billing/service";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

export async function setProjectPlanLegacy(params: {
  projectId: string;
  userEmail: string;
  plan: string;
  stripeSessionId: string;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase
    .from("projects")
    .update({
      plan: params.plan,
      stripe_session_id: params.stripeSessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.projectId)
    .eq("user_email", params.userEmail.toLowerCase());

  if (error) {
    console.error("Failed to set project plan:", error.message);
    return false;
  }

  return true;
}

export type CheckoutActivation = {
  planId: string;
  planName: string;
  projectId: string | null;
  businessName: string | null;
  email: string | null;
};

/**
 * Legacy Stripe Checkout activation — kept for old sessions.
 * Prefer admin `setUserPlan` until a provider is wired for real.
 */
export async function activateCheckoutSession(
  sessionId: string,
): Promise<CheckoutActivation | null> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid" && session.status !== "complete") {
    return null;
  }

  const planIdRaw = session.metadata?.planId?.trim();
  if (!planIdRaw || !isPlanId(planIdRaw)) return null;

  const projectId = session.metadata?.projectId?.trim() || null;
  const email =
    session.customer_email?.trim() ||
    session.metadata?.userEmail?.trim() ||
    null;
  const businessName = session.metadata?.businessName?.trim() || null;
  const planName = session.metadata?.planName?.trim() || planIdRaw;

  if (email) {
    await BillingService.changePlan({
      userEmail: email,
      planId: planIdRaw,
      provider: "stripe",
      metadata: { stripeSessionId: sessionId, projectId },
    });
  }

  if (projectId && email) {
    await setProjectPlanLegacy({
      projectId,
      userEmail: email,
      plan: planIdRaw,
      stripeSessionId: sessionId,
    });
  }

  return {
    planId: planIdRaw,
    planName,
    projectId,
    businessName,
    email,
  };
}
