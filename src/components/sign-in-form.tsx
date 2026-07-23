"use client";

import { LegalConsentCheckbox } from "@/components/legal/legal-consent-checkbox";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";

type SignInFormProps = {
  callbackUrl?: string;
  googleEnabled?: boolean;
};

export function SignInForm({
  callbackUrl = "/dashboard",
  googleEnabled = true,
}: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHint(null);
    try {
      const res = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as {
        error?: string;
        devHint?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Could not send code");
      setHint(data.devHint ?? "Check your inbox for a 6-digit code.");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("email-otp", {
        email,
        code,
        callbackUrl,
        redirect: false,
      });
      if (result?.error) {
        throw new Error("Invalid or expired code");
      }
      window.location.href = result?.url || callbackUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <LegalConsentCheckbox
        id="legal-consent-login"
        checked={consentAccepted}
        onChange={setConsentAccepted}
      />

      {googleEnabled && (
        <>
          <button
            type="button"
            disabled={!consentAccepted}
            onClick={() => signIn("google", { callbackUrl })}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-surface-border bg-surface px-4 py-3 text-sm font-medium transition hover:border-brand/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-surface-border" />
            or email
            <span className="h-px flex-1 bg-surface-border" />
          </div>
        </>
      )}

      {step === "email" ? (
        <form onSubmit={sendCode} className="space-y-3">
          <label className="block text-left text-sm">
            <span className="mb-1.5 block text-muted">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
              className="w-full rounded-xl border border-surface-border bg-background px-4 py-3 text-sm outline-none ring-brand/40 focus:ring-2"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !consentAccepted}
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending…" : "Email me a login code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-3">
          <p className="text-left text-sm text-muted">
            Code sent to <span className="text-foreground">{email}</span>
          </p>
          <label className="block text-left text-sm">
            <span className="mb-1.5 block text-muted">6-digit code</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="123456"
              className="w-full rounded-xl border border-surface-border bg-background px-4 py-3 text-center text-lg tracking-[0.35em] outline-none ring-brand/40 focus:ring-2"
            />
          </label>
          <button
            type="submit"
            disabled={loading || code.length !== 6 || !consentAccepted}
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="w-full text-sm text-muted hover:text-foreground"
          >
            Use a different email
          </button>
        </form>
      )}

      {hint && !error && (
        <p className="text-center text-xs text-muted">{hint}</p>
      )}
      {error && (
        <p className="text-center text-sm text-red-300">{error}</p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
