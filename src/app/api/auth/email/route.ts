import { isEmailLoginConfigured, requestEmailOtp } from "@/lib/email-otp";
import { NextResponse } from "next/server";

/** POST /api/auth/email — send a 6-digit login code */
export async function POST(request: Request) {
  if (!isEmailLoginConfigured()) {
    return NextResponse.json(
      {
        error:
          "Email login is not configured. Set AUTH_RESEND_KEY or use Google.",
        code: "EMAIL_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }

  let body: { email?: unknown };
  try {
    body = (await request.json()) as { email?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  if (!email.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const result = await requestEmailOtp(email);
    return NextResponse.json({
      ok: true,
      email: result.email,
      // Hint only in non-production when Resend is missing
      devHint:
        result.mode === "dev-console"
          ? "Check the server console for your login code."
          : undefined,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "OTP_FAILED";
    if (code === "INVALID_EMAIL") {
      return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
    }
    if (code === "EMAIL_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "Email login is not configured", code },
        { status: 503 },
      );
    }
    console.error("Email OTP request failed:", error);
    return NextResponse.json(
      { error: "Could not send login code", code },
      { status: 500 },
    );
  }
}
