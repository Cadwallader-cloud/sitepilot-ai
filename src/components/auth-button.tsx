"use client";

import { SignInForm } from "@/components/sign-in-form";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function AuthButton({
  compact = false,
  callbackUrl = "/dashboard",
}: {
  compact?: boolean;
  callbackUrl?: string;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="text-sm text-muted">{compact ? "…" : "Loading…"}</span>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {!compact && session.user.name && (
          <span className="hidden text-sm text-muted sm:inline">
            {session.user.name}
          </span>
        )}
        <Link
          href="/dashboard"
          className="hidden text-sm text-muted transition hover:text-foreground sm:inline"
        >
          My Websites
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-full border border-surface-border px-4 py-2 text-sm text-muted transition hover:border-brand/40 hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
      className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface px-4 py-2 text-sm font-medium transition hover:border-brand/40 hover:text-foreground"
    >
      {compact ? "Sign in" : "Sign in"}
    </Link>
  );
}

export function SignInGate() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-surface-border bg-surface p-10 text-center">
      <p className="text-4xl">🔐</p>
      <h2 className="mt-4 text-2xl font-bold">Sign in to build your website</h2>
      <p className="mt-3 text-sm text-muted">
        Without an account you can&apos;t return to your sites later. Use Google
        or email — free, no card required.
      </p>
      <div className="mt-8 flex justify-center">
        <SignInForm callbackUrl="/create" />
      </div>
    </div>
  );
}
