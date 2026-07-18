"use client";

import Link from "next/link";

type PublishCTAProps = {
  businessName?: string;
};

export function PublishCTA({ businessName }: PublishCTAProps) {
  const params = businessName
    ? `?business=${encodeURIComponent(businessName)}`
    : "";

  return (
    <div className="mt-8 rounded-2xl border border-brand/30 bg-brand/10 p-8 text-center">
      <p className="text-lg font-semibold">Looks good?</p>
      <p className="mt-2 text-muted">
        Publish your website and start getting more customers online.
      </p>
      <Link
        href={`/publish${params}`}
        className="mt-6 inline-flex h-14 items-center justify-center rounded-full bg-brand px-10 text-lg font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-light"
      >
        Publish website — $199
      </Link>
      <p className="mt-3 text-xs text-muted">
        Includes hosting setup · Custom domain · Live within 24 hours
      </p>
    </div>
  );
}
