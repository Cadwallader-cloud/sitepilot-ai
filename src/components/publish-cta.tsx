"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PublishCTAProps = {
  businessName?: string;
};

export function PublishCTA({ businessName }: PublishCTAProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Publish failed");
      }

      const params = businessName
        ? `?business=${encodeURIComponent(businessName)}`
        : "";
      router.push(`/publish/success${params}`);
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Could not publish",
      );
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-brand/30 bg-brand/10 p-8 text-center">
      <p className="text-lg font-semibold">Looks good?</p>
      <p className="mt-2 text-muted">
        Publish your website and start getting customers online.
      </p>
      <button
        type="button"
        onClick={handlePublish}
        disabled={loading}
        className="mt-6 inline-flex h-14 items-center justify-center rounded-full bg-brand px-10 text-lg font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-light disabled:opacity-60"
      >
        {loading ? "Publishing…" : "Publish"}
      </button>
      {error && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs text-muted">
        Live within 24 hours · Custom domain available
      </p>
    </div>
  );
}
