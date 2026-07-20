import { auth } from "@/auth";
import { CONTACT_EMAIL } from "@/lib/plans";
import { NextResponse } from "next/server";

/** Self-serve Stripe checkout is paused — Pro is Contact us. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  return NextResponse.json(
    {
      error: "Checkout unavailable. Contact us to upgrade to Pro.",
      contactEmail: CONTACT_EMAIL,
      upgradeRequired: true,
    },
    { status: 503 },
  );
}
