import { createHash, randomInt } from "crypto";
import { Resend } from "resend";
import { getSupabaseAdmin } from "./supabase";

const OTP_TTL_MS = 10 * 60 * 1000;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashCode(email: string, code: string) {
  return createHash("sha256")
    .update(`${email}:${code}:${process.env.AUTH_SECRET ?? "crestis"}`)
    .digest("hex");
}

function generateCode() {
  return String(randomInt(100000, 999999));
}

async function sendOtpEmail(email: string, code: string) {
  const apiKey = process.env.AUTH_RESEND_KEY?.trim();
  const from =
    process.env.AUTH_EMAIL_FROM?.trim() || "Crestis <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email-otp] DEV code for ${email}: ${code}`);
      return { ok: true as const, mode: "dev-console" as const };
    }
    throw new Error("EMAIL_NOT_CONFIGURED");
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `${code} is your Crestis login code`,
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;margin:0 0 12px">Sign in to Crestis</h1>
        <p style="color:#444;margin:0 0 16px">Use this code within 10 minutes:</p>
        <p style="font-size:32px;letter-spacing:6px;font-weight:700;margin:0 0 16px">${code}</p>
        <p style="color:#888;font-size:12px;margin:0">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
    text: `Your Crestis login code is ${code}. It expires in 10 minutes.`,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("EMAIL_SEND_FAILED");
  }

  return { ok: true as const, mode: "resend" as const };
}

export async function requestEmailOtp(rawEmail: string) {
  const email = normalizeEmail(rawEmail);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("INVALID_EMAIL");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("SUPABASE_NOT_CONFIGURED");

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

  const { error } = await supabase.from("email_otps").upsert({
    email,
    code_hash: hashCode(email, code),
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("OTP upsert failed:", error.message);
    throw new Error("OTP_STORE_FAILED");
  }

  const sent = await sendOtpEmail(email, code);
  return { email, mode: sent.mode };
}

export async function verifyEmailOtp(rawEmail: string, rawCode: string) {
  const email = normalizeEmail(rawEmail);
  const code = rawCode.trim().replace(/\s/g, "");
  if (!email || !/^\d{6}$/.test(code)) return null;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("email_otps")
    .select("code_hash, expires_at")
    .eq("email", email)
    .maybeSingle();

  if (error || !data) return null;
  if (new Date(data.expires_at as string).getTime() < Date.now()) {
    await supabase.from("email_otps").delete().eq("email", email);
    return null;
  }

  if ((data.code_hash as string) !== hashCode(email, code)) return null;

  await supabase.from("email_otps").delete().eq("email", email);

  return {
    id: email,
    email,
    name: email.split("@")[0] || "User",
  };
}

export function isEmailLoginConfigured() {
  return Boolean(
    process.env.AUTH_RESEND_KEY?.trim() ||
      process.env.NODE_ENV !== "production",
  );
}
