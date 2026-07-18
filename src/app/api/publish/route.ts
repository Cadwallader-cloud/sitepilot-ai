import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const businessName =
      typeof body.businessName === "string" ? body.businessName.trim() : "";

    // MVP: acknowledge publish request — payment & hosting come later
    console.info("Publish request", {
      user: session.user.email,
      businessName: businessName || "unknown",
    });

    return NextResponse.json({
      ok: true,
      message: "Publish request received",
    });
  } catch {
    return NextResponse.json({ error: "Publish failed" }, { status: 500 });
  }
}
