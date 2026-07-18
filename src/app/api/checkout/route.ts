import { getAppUrl, getStripe, PUBLISH_PRICE_CENTS } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const businessName =
      typeof body.businessName === "string" ? body.businessName.trim() : "";

    const stripe = getStripe();
    const baseUrl = getAppUrl(request.nextUrl.origin);

    const cancelUrl = businessName
      ? `${baseUrl}/publish?business=${encodeURIComponent(businessName)}`
      : `${baseUrl}/publish`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: PUBLISH_PRICE_CENTS,
            product_data: {
              name: "Crestis — Website Publish",
              description: businessName
                ? `Publish website for ${businessName}`
                : "Professional contractor website — live in 24 hours",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        businessName: businessName || "unknown",
      },
      success_url: `${baseUrl}/publish/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not create checkout session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
